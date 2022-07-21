import { Icon, Image, List } from "@raycast/api";
import { Activity, PaginatedResponse, PullRequest } from "./api/pull-requests";
import { useResouce } from "./use-async";
import Mask = Image.Mask;

interface PrActivityProps {
  pr: PullRequest;
}

export function PrActivity(props: PrActivityProps) {
  const [activity, activityLoading] = useResouce<PaginatedResponse<Activity>>(props.pr.links.activity, {
    internal: true,
  });

  return (
    <List
      isLoading={activityLoading}
      isShowingDetail={true}
      navigationTitle={`${props.pr.destination.repository.name} > PR#${props.pr.id} > Activity`}
      searchBarAccessory={
        <List.Dropdown tooltip="Type">
          <List.Dropdown.Item title="All" value="all" />
          <List.Dropdown.Item title="Comments" value="comments" icon={Icon.Bubble} />
          <List.Dropdown.Item title="Updates" value="updates" icon={Icon.Upload} />
          <List.Dropdown.Item title="Tasks" value="tasks" icon={Icon.Checkmark} />
        </List.Dropdown>
      }
    >
      <List.Section title="new">
        {activity?.values.map((item) => (
          <PrActivityItem activity={item} key={Math.random()} />
        ))}
      </List.Section>
      <List.Section title="old" />
    </List>
  );
}

export function PrActivityItem(props: { activity: Activity }) {
  console.log(props.activity);
  if (props.activity.comment) {
    return (
      <List.Item
        id={`comment-${props.activity.comment.created_on}`}
        title={props.activity.comment.content.raw}
        icon={Icon.Bubble}
        accessories={[
          {
            text: props.activity.comment.user.display_name,
            icon: {
              source: props.activity.comment.user.links.avatar.href,
              mask: Mask.Circle,
            },
          },
        ]}
        detail={<List.Item.Detail markdown={props.activity.comment.content.raw} />}
      />
    );
  } else if (props.activity.task) {
    console.log("Task!!");
    return (
      <List.Item
        id={`task-${props.activity.task.task.created_on}`}
        title={props.activity.task.task.content.raw}
        icon={Icon.Checkmark}
        accessories={[
          {
            text: props.activity.task.actor.display_name,
            icon: {
              source: props.activity.task.actor.links.avatar.href,
              mask: Mask.Circle,
            },
          },
        ]}
        detail={<List.Item.Detail markdown={props.activity.task.task.content.raw} />}
      />
    );
  }

  return null;
}
