/**
 * SocialLinks.jsx — icon-button row for the footer.
 *
 * Built from eventConfig; each icon is hidden when its config value is null (plan section H).
 * Order: Instagram, LinkedIn, GitHub, X, Website, Email.
 * Renders nothing when no channel is configured.
 */
import eventConfig from '../../config/eventConfig.js'
import {
  InstagramIcon,
  LinkedInIcon,
  GithubIcon,
  XIcon,
  GlobeIcon,
  MailIcon,
} from './SocialIcons.jsx'

const { social, contact, organizer } = eventConfig

/** 44×44 target, 1px cream/20 border, lime on hover/focus, visible focus ring on near-black */
const btnCls = `inline-flex items-center justify-center size-11 max-[360px]:size-10 shrink-0
  rounded-[var(--radius-md)] border border-[var(--color-cream)]/20
  text-[var(--color-cream)]/80 no-underline
  hover:border-[var(--color-lime)] hover:text-[var(--color-lime)]
  focus-visible:border-[var(--color-lime)] focus-visible:text-[var(--color-lime)]
  transition-colors duration-[var(--duration-fast)]
  focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cream)]`

const channels = [
  social.instagram && {
    key: 'instagram',
    href: social.instagram,
    label: `${organizer} on Instagram (opens in new tab)`,
    title: 'Instagram',
    Icon: InstagramIcon,
    external: true,
  },
  social.linkedin && {
    key: 'linkedin',
    href: social.linkedin,
    label: `${organizer} on LinkedIn (opens in new tab)`,
    title: 'LinkedIn',
    Icon: LinkedInIcon,
    external: true,
  },
  social.github && {
    key: 'github',
    href: social.github,
    label: `${organizer} on GitHub (opens in new tab)`,
    title: 'GitHub',
    Icon: GithubIcon,
    external: true,
  },
  social.x && {
    key: 'x',
    href: social.x,
    label: `${organizer} on X (opens in new tab)`,
    title: 'X',
    Icon: XIcon,
    external: true,
  },
  contact.website && {
    key: 'website',
    href: contact.website,
    label: `${organizer} website, ${contact.websiteLabel || contact.website} (opens in new tab)`,
    title: contact.websiteLabel || 'Website',
    Icon: GlobeIcon,
    external: true,
  },
  contact.email && {
    key: 'email',
    href: `mailto:${contact.email}`,
    label: `Email ${organizer}, ${contact.email}`,
    title: contact.email,
    Icon: MailIcon,
    external: false,
  },
].filter(Boolean)

export default function SocialLinks({ className = '' }) {
  if (!channels.length) return null

  return (
    <ul
      aria-label="Follow us"
      className={`list-none p-0 m-0 flex flex-wrap gap-3 max-[360px]:gap-2 ${className}`}
    >
      {channels.map(({ key, href, label, title, Icon, external }) => (
        <li key={key}>
          <a
            href={href}
            aria-label={label}
            title={title}
            className={btnCls}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  )
}
