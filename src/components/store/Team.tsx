'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Store, TeamMember } from '../../data/store'
import Section from './Section'

// Local card: portrait photo + name + role. Kept inside Team.tsx per section spec.
function EmployeeCard({
  member,
  onClick,
}: {
  member: TeamMember
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer flex-col text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action-border"
      aria-label={`Open profile for ${member.name}`}
    >
      <img
        src={member.photo}
        alt={member.name}
        className="aspect-square w-full bg-base-surface-subtle object-cover transition-opacity group-hover:opacity-90"
      />
      <span className="flex h-[165px] flex-col gap-xs overflow-hidden pt-sm">
        <span className="flex flex-col">
          <span className="font-heading text-heading-m text-base-text">{member.name}</span>
          <span className="-mt-[2px] text-body-l font-semibold text-action-text-link">{member.role}</span>
        </span>
        {member.description && (
          <>
            <span className="h-[63px] overflow-hidden text-body-m text-base-text [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
              {member.description}
            </span>
            <span className="mt-auto font-action text-action-s uppercase text-action-text-navigation underline-offset-4 group-hover:underline">
              Read more
            </span>
          </>
        )}
      </span>
    </button>
  )
}

function TeamMemberModal({
  member,
  onClose,
  onPrevious,
  onNext,
}: {
  member: TeamMember
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
      if (event.key === 'ArrowLeft') {
        onPrevious()
      }
      if (event.key === 'ArrowRight') {
        onNext()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, onNext, onPrevious])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-m py-xl"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-member-modal-title"
        className="relative grid w-full max-w-[880px] overflow-hidden bg-base-surface shadow-2xl md:grid-cols-[minmax(280px,360px)_1fr]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute right-sm top-sm z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-base-surface text-[28px] leading-none text-base-text shadow-md transition-colors hover:bg-base-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-border"
          aria-label="Close team member profile"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <img
          src={member.photo}
          alt={member.name}
          className="h-full min-h-[320px] w-full bg-base-surface-subtle object-cover"
        />

        <div className="flex flex-col justify-center gap-m p-ml pb-xl pr-xl md:p-xl">
          <div className="flex flex-col">
            <h3
              id="team-member-modal-title"
              className="font-heading text-heading-l text-base-text-heading"
            >
              {member.name}
            </h3>
            <p className="-mt-[2px] text-body-l font-semibold text-base-text-emphasis">{member.role}</p>
          </div>

          {member.description && (
            <p className="text-body-l leading-relaxed text-base-text">{member.description}</p>
          )}

          <div className="absolute bottom-sm right-sm flex gap-xs">
            <button
              type="button"
              onClick={onPrevious}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-action-border bg-transparent text-[22px] leading-none text-action-text transition-colors hover:bg-base-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-border"
              aria-label="Show previous team member"
            >
              <span aria-hidden="true" className="-mt-[4px]">
                &lsaquo;
              </span>
            </button>
            <button
              type="button"
              onClick={onNext}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-action-border bg-transparent text-[22px] leading-none text-action-text transition-colors hover:bg-base-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-border"
              aria-label="Show next team member"
            >
              <span aria-hidden="true" className="-mt-[4px]">
                &rsaquo;
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Team({ store }: { store: Store }) {
  const { team } = store
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number | null>(null)
  const selectedMember =
    selectedMemberIndex === null || !team ? null : team.members[selectedMemberIndex]

  const closeMemberModal = useCallback(() => {
    setSelectedMemberIndex(null)
  }, [])

  const memberCount = team?.members.length ?? 0
  const showPreviousMember = useCallback(() => {
    setSelectedMemberIndex((currentIndex) =>
      currentIndex === null ? currentIndex : (currentIndex - 1 + memberCount) % memberCount,
    )
  }, [memberCount])

  const showNextMember = useCallback(() => {
    setSelectedMemberIndex((currentIndex) =>
      currentIndex === null ? currentIndex : (currentIndex + 1) % memberCount,
    )
  }, [memberCount])

  if (!team) return null

  return (
    <Section bg="surface" innerClassName="!pt-0 !pb-xxl">
      <div className="flex flex-col gap-ml">
        <h2 className="text-heading-l text-base-text-heading">{team.title}</h2>
        <ul className="grid grid-cols-1 gap-ml sm:grid-cols-2 lg:grid-cols-4">
          {team.members.map((member, index) => (
            <li key={member.name}>
              <EmployeeCard member={member} onClick={() => setSelectedMemberIndex(index)} />
            </li>
          ))}
        </ul>

        {selectedMember && (
          <TeamMemberModal
            member={selectedMember}
            onClose={closeMemberModal}
            onPrevious={showPreviousMember}
            onNext={showNextMember}
          />
        )}
      </div>
    </Section>
  )
}
