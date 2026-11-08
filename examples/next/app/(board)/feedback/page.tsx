import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Card,
  CardDescription,
  CardLink,
  CardTitle,
  EmptyState,
  FeedbackBanner,
  Illustration,
  Kbd,
  LinkButton,
  Progress,
  ProgressRing,
  ProgressSteps,
  Separator,
  Skeleton,
  Spinner,
} from "kumiko-ui";
import NextLink from "next/link";

export default function FeedbackPage() {
  return (
    <>
      <h1 className="font-display text-headline font-bold">Every application is a step forward</h1>
      <Alert
        status="info"
        title="Add a little more to your profile"
        action={<LinkButton render={<NextLink href="/forms" />}>Complete profile</LinkButton>}
      >
        A short introduction helps employers understand what you want to work on.
      </Alert>
      <FeedbackBanner
        title="Your application reached Maple Studio"
        description="You can keep preparing while the team reviews it."
        action={<LinkButton render={<NextLink href="/data" />}>Open tracker</LinkButton>}
      />
      <Card>
        <CardTitle level={2}>Getting interview-ready</CardTitle>
        <Progress value={80} label="Profile complete" />
        <div className="flex flex-wrap items-center gap-3">
          <ProgressRing value={3} max={5} aria-label="Weekly application goal" />
          <p>Three thoughtful applications toward your weekly goal of five.</p>
        </div>
        <ProgressSteps
          steps={["Profile", "Apply", "Interview", "Offer"]}
          current={2}
          aria-label="Application progress"
        />
        <p className="text-body-sm text-ink-muted">Current step: Interview preparation.</p>
      </Card>
      <section className="grid gap-3" aria-labelledby="hiring-team">
        <h2 id="hiring-team" className="font-display text-title font-bold">
          Meet the hiring team
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Avatar name="Alex Morgan" />
          <span>Alex Morgan, your recruiter</span>
          <Badge tone="info">Interview scheduled</Badge>
        </div>
        <AvatarGroup max={3} aria-label="Your interview panel">
          <Avatar name="Priya Shah" accent="leaf" />
          <Avatar name="Zain Ahmed" accent="sun" />
          <Avatar name="Maya Chen" accent="tide" />
          <Avatar name="Sam Taylor" accent="coral" />
        </AvatarGroup>
      </section>
      <Separator />
      <div className="grid min-w-0 gap-6 @lg:grid-cols-2">
        <Card aria-busy="true">
          <CardTitle level={2}>New recommendations</CardTitle>
          <p className="inline-flex items-center gap-2">
            <Spinner label="Loading recommendations" />
            Looking for more good fits
          </p>
          <Skeleton shape="text" className="w-3/4" />
          <Skeleton className="h-24 w-full" />
        </Card>
        <EmptyState
          headingLevel={2}
          art={<Illustration name="sealed-envelope" />}
          title="No archived applications"
          description="Your active applications are waiting in the tracker."
          actions={<LinkButton render={<NextLink href="/data" />}>View applications</LinkButton>}
        />
      </div>
      <Card>
        <CardTitle level={2}>
          <CardLink render={<NextLink href="/forms" />}>Frontend engineer at Cedar Labs</CardLink>
        </CardTitle>
        <CardDescription>Remote, with a learning budget and a supportive first-year plan.</CardDescription>
        <Badge tone="leaf">Good fit</Badge>
      </Card>
      <p className="text-body-sm text-ink-muted">
        Use <Kbd>Tab</Kbd> to move between controls and <Kbd>Enter</Kbd> to follow a link.
      </p>
    </>
  );
}
