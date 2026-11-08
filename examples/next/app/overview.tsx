import { Card, CardDescription, CardLink, CardTitle, LinkButton } from "kumiko-ui";
import NextLink from "next/link";
import { destinations } from "./destinations";

/** Server-rendered overview reused by the light, dark and Arabic roots.
 * Use when: welcoming a job seeker. Avoid when: collecting profile data.
 */
export function Overview({ arabic = false }: { arabic?: boolean }) {
  return (
    <>
      <h1 className="font-display text-headline font-bold">
        {arabic ? "وظيفتك القادمة تبدأ هنا" : "Your next role starts here"}
      </h1>
      <p className="text-ink-muted">
        {arabic
          ? "أكمل ملفك وتابع الفرص المناسبة لك."
          : "Build your profile, find a good fit and keep track of every application."}
      </p>
      <div>
        <LinkButton tone="primary" render={<NextLink href="/navigation" />}>
          {arabic ? "تصفح الوظائف" : "Browse jobs"}
        </LinkButton>
      </div>
      <div className="grid min-w-0 gap-4 @lg:grid-cols-2">
        {destinations
          .filter((destination) => destination.href !== "/")
          .map((destination) => (
            <Card key={destination.href}>
              <CardTitle level={2}>
                <CardLink
                  render={<NextLink href={destination.href} />}
                  lang={destination.href === "/ar" ? "ar" : undefined}
                >
                  {arabic ? destination.ar : destination.title}
                </CardLink>
              </CardTitle>
              <CardDescription>{arabic ? destination.arDescription : destination.description}</CardDescription>
            </Card>
          ))}
      </div>
    </>
  );
}
