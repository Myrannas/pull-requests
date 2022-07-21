import fetch from "node-fetch";
import { getPreferenceValues, LocalStorage } from "@raycast/api";
import { URLSearchParams } from "url";

const cache = new Map();

export async function request<T>(path: string, { internal = false, fields = [] } = {}): Promise<T> {
  const preferences = getPreferenceValues();
  console.log(preferences);

  let url = path.startsWith("https") ? path : `https://api.bitbucket.org/2.0${path}`;

  const params = new URLSearchParams();
  if (fields.length > 0) {
    params.set("fields", fields.map((field) => `${field}`).join(","));
  }

  if (internal) {
    url = url.replace("2.0", "internal");
  }

  console.log({ url });

  if (cache.has(url)) {
    return cache.get(url);
  }

  const result = await fetch(url, {
    headers: {
      authorization: `Basic ${Buffer.from(preferences.username + ":" + preferences.token).toString("base64")}}`,
    },
  });

  const data = (await result.json()) as T;

  cache.set(url, data);

  return data;
}

async function getCurrentUser(): Promise<string> {
  let accountId = await LocalStorage.getItem<string>("user");

  if (!accountId) {
    const { account_id } = await request<{ account_id: string }>("/user");

    await LocalStorage.setItem("user", account_id);
    accountId = account_id;
  }

  return accountId;
}

type Links<K extends string = string> = Record<K, { href: string }>;

export interface PaginatedResponse<T> {
  values: T[];
  pagelen: number;
}

export interface PullRequest extends Entity<"pullrequest", "statuses" | "html" | "activity"> {
  description: string;
  title: string;
  close_source_branch: boolean;
  id: number;
  destination: Origin;
  created_on: string;
  summary: RichText;
  source: Origin;
  comment_count: number;
  state: string;
  task_count: number;
  reason: string;
  updated_on: string;
  author: User;
  merge_commit: null;
  closed_by: null;
}

interface RichText {
  raw: string;
  markup: "markdown";
}

interface User {
  display_name: string;
  links: Links<"avatar">;
}

interface Origin {
  commit: Commit;
  repository: Repository;
  branch: { name: string };
}

export interface Entity<T extends string, L extends string = string> {
  links: Links<L | "self">;
  type: T;
}

export interface Commit extends Entity<"commit", "commit"> {
  hash: string;
}

export interface Repository extends Entity<"repository", "html" | "avatar"> {
  name: string;
  full_name: string;
  uuid: string;
}

type DateTime = string;

export interface Status extends Entity<"build", "commit"> {
  key: string;
  description: string;
  repository: Repository;
  url: string;
  refname: string;
  state: "SUCCESSFUL";
  created_on: DateTime;
  commit: Commit;
  updated_on: DateTime;
  name: string;
}

export interface Comment extends Entity<"pullrequest_comment", "html"> {
  deleted: boolean;
  content: RichText;
  created_on: DateTime;
  pullrequest: PullRequest;
  user: User;
  updated_on: DateTime;
}

export interface Task extends Entity<"task", "html"> {
  creator: User;
  created_on: DateTime;
  content: RichText;
  state: "UNRESOLVED";
  updated_on: DateTime;
}

export interface TaskUpdate {
  action: "CREATED";
  task: Task;
  actor: User;
  action_on: DateTime;
}

export interface Activity {
  task: TaskUpdate;
  comment?: Comment;
  pull_request: PullRequest;
}

export async function getPullRequests(): Promise<PaginatedResponse<PullRequest>> {
  const accountId = await getCurrentUser();
  console.log(accountId);
  // fetch('https://bitbucket.org/2.0/pullrequests/{selected_user}')

  return await request(`/pullrequests/${accountId}`);
}
