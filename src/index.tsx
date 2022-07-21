import { Action, ActionPanel, Color, Icon, Image, List } from "@raycast/api";
import { useState } from "react";
import { getPullRequests, PaginatedResponse, PullRequest, request, Status } from "./api/pull-requests";
import { PullRequestDetails } from "./pr-details";
import { useAsync } from "./use-async";
import { PrActivity } from "./pr-activity";

export default function ArticleList() {
  const [selected, setSelected] = useState<string | null>();
  const [state, isLoading] = useAsync(() => getPullRequests(), true);

  console.log(state);

  return (
    <List
      isLoading={isLoading}
      isShowingDetail={state !== null}
      onSelectionChange={(selected) => {
        setSelected(selected);
      }}
    >
      <List.Section title="Open PRs">
        {state?.values.map((item) => (
          <PullRequestListItem value={item} selected={item.links.self.href === selected} />
        ))}
      </List.Section>
    </List>
  );
}

function PullRequestListItem({ value: pr, selected }: { value: PullRequest; selected: boolean }) {
  const {
    links: { self, statuses, html },
    description,
    title,
    comment_count,
    task_count,
    state,
    summary,
    source,
    destination,
    author: {
      display_name,
      links: { avatar },
    },
  } = pr;
  const [statusDetails] = useAsync<PaginatedResponse<Status>>(() => request(statuses.href), selected);

  const successfulBuilds = statusDetails?.values.filter((build) => build.state === "SUCCESSFUL").length ?? 0;
  const totalBuilds = statusDetails?.values.length ?? 0;
  const resultColor = successfulBuilds === totalBuilds ? Color.Green : Color.Red;

  console.log(statusDetails);

  return (
    <List.Item
      id={self.href}
      key={self.href}
      title={title}
      icon={{ source: Icon.Circle, tintColor: Color.Blue }}
      actions={
        <ActionPanel>
          <Action.Push title="Activity" target={<PrActivity pr={pr} />} />
          <Action.Push title="Details" target={<PullRequestDetails pr={pr} />} />
          <Action.OpenInBrowser url={html.href} />
        </ActionPanel>
      }
      detail={
        <List.Item.Detail
          markdown={summary?.raw ?? description}
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label title="status" text={state.toLowerCase()} />
              <List.Item.Detail.Metadata.Label title="comments" text={String(comment_count)} />
              <List.Item.Detail.Metadata.Label title="tasks" text={String(task_count)} />
              <List.Item.Detail.Metadata.Label
                title="branch"
                text={`${source.branch.name} -> ${destination.branch.name}`}
              />
              <List.Item.Detail.Metadata.Label
                title="author"
                text={display_name}
                icon={{
                  source: avatar.href,
                  mask: Image.Mask.Circle,
                }}
              />
              {totalBuilds > 0 ? (
                <List.Item.Detail.Metadata.Label
                  title="Builds"
                  text={`${successfulBuilds} / ${totalBuilds}`}
                  icon={{
                    source: Icon.Dot,
                    tintColor: resultColor,
                  }}
                />
              ) : null}
            </List.Item.Detail.Metadata>
          }
        />
      }
    />
  );
}
