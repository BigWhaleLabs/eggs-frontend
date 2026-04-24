import { JSX } from 'preact/jsx-runtime'

export default function DottedInfo({
  info,
  value,
}: {
  info: JSX.Element | string
  value: string | number
}) {
  return (
    <div className="flex flex-row w-full">
      <div
        className="text-2xl text-jet"
        style={{
          lineHeight: 'normal',
        }}
      >
        {info}
      </div>
      <div className="h-px border-b-2 border-dotted mx-1 border-jet-0.6 flex flex-1 self-end mb-1.5" />{' '}
      <p
        className="text-2xl text-bright-greek"
        style={{
          lineHeight: 'normal',
        }}
      >
        {value}
      </p>
    </div>
  )
}
