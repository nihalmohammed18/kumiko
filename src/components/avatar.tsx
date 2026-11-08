"use client";

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { Children, type ComponentProps, isValidElement, type ReactElement } from "react";
import { formatLabel } from "../labels.ts";
import { cn, type VariantProps } from "../lib/tv.ts";
import { useKumiko } from "../provider.tsx";
import { avatarInitials } from "./avatar-initials.ts";
import { avatarStyles } from "./avatar-styles.ts";

type AvatarVariants = VariantProps<typeof avatarStyles>;

/** A named profile image, its dimensions and fallback accent, plus native Base UI root props.
 * Use when: typing Avatar. Avoid when: configuring a collection; use AvatarGroupProps.
 */
export interface AvatarProps extends Omit<BaseAvatar.Root.Props, "children" | "className"> {
  src?: string;
  name: string;
  size?: AvatarVariants["size"];
  accent?: AvatarVariants["accent"];
  className?: string;
}

/** A round profile image with accessible, grapheme-aware initials while loading or after an image error.
 * Use when: identifying a person visually. Avoid when: the image needs to be a control; wrap it in a Link or Button.
 *
 * @example
 * <Avatar name="Aisha Khan" src="https://jobs.example.com/profiles/aisha.png" />
 */
export function Avatar({ src, name, size = "md", accent = "brand", className, ...props }: AvatarProps) {
  const { locale } = useKumiko();
  return (
    <BaseAvatar.Root {...props} data-slot="avatar" className={avatarStyles({ size, accent, className })}>
      <BaseAvatar.Fallback
        data-slot="avatar-fallback"
        role="img"
        aria-label={name}
        className="absolute inset-0 flex size-full items-center justify-center"
      >
        <span aria-hidden>{avatarInitials(name, locale)}</span>
      </BaseAvatar.Fallback>
      <BaseAvatar.Image
        keepMounted
        src={src}
        alt={name}
        data-slot="avatar-image"
        className="absolute inset-0 size-full object-cover data-loading:invisible data-error:invisible"
      />
    </BaseAvatar.Root>
  );
}

/** A required group name, direct Avatar children and an optional limit on visible people.
 * Use when: typing AvatarGroup. Avoid when: naming an individual image; use AvatarProps.
 */
export interface AvatarGroupProps extends Omit<ComponentProps<"fieldset">, "children" | "aria-label" | "role"> {
  "aria-label": string;
  children: ReactElement<AvatarProps> | ReactElement<AvatarProps>[];
  max?: number;
}

/** Overlapping avatars with a localized count for people beyond max, mirrored in right-to-left layouts.
 * Use when: identifying a named team or collection of people. Avoid when: each person needs a separate list row.
 */
export function AvatarGroup({ children, max, className, "aria-label": label, ...props }: AvatarGroupProps) {
  const { locale, labels } = useKumiko();
  const avatars = Children.toArray(children).filter(isValidElement<AvatarProps>);
  const visible = avatars.slice(0, Math.max(0, Math.floor(max ?? avatars.length)));
  const remaining = avatars.length - visible.length;
  const itemClass = "inline-flex shrink-0 -ms-3 rounded-full ring-2 ring-surface";
  return (
    <fieldset
      {...props}
      data-slot="avatar-group"
      aria-label={label}
      className={cn("flex min-w-0 flex-wrap items-center gap-y-2 ps-3", className)}
    >
      {visible.map((avatar) => (
        <span key={avatar.key} data-slot="avatar-group-item" className={itemClass}>
          {avatar}
        </span>
      ))}
      {remaining > 0 && (
        <span data-slot="avatar-group-item" className={itemClass}>
          <span
            data-slot="avatar"
            role="img"
            aria-label={formatLabel(labels.moreCount, locale, remaining)}
            className={avatarStyles({ size: avatars[0]?.props.size ?? "md" })}
          >
            <span aria-hidden dir="ltr">
              +{new Intl.NumberFormat(locale).format(remaining)}
            </span>
          </span>
        </span>
      )}
    </fieldset>
  );
}
