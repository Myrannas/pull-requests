import { Action, ActionPanel, Detail, List } from "@raycast/api";
import { PaginatedResponse, PullRequest, Status } from "./api/pull-requests";
import { useAsync, useResouce } from "./use-async";

interface PullRequestDetailsProps {
  pr: PullRequest;
}

export function PullRequestDetails({ pr: { title, links, summary } }: PullRequestDetailsProps) {
  return (
    <Detail
      navigationTitle={title}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={links.html.href} />
        </ActionPanel>
      }
      markdown={summary.raw}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Test" />
        </Detail.Metadata>
      }
    />
  );
}
