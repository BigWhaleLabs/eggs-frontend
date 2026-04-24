import { JSX } from 'preact/jsx-runtime'

export function PrimaryButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      className="cursor-pointer"
      style={{
        cursor: 'pointer',
        borderRadius: 4,
        background: '#FFB700',
        boxShadow: '0px 4px 8px 0px #F12696',
        padding: '16px 24px 12px 24px',
        color: '#333534',
        lineHeight: 'normal',
        fontSize: 32,
      }}
      {...props}
    >
      {props.children}
    </button>
  )
}

export function ActionButton({
  children,
  backgroundColor,
  onClick,
  disabled,
  textColor = 'text-nuclear-blast',
  borderColor = 'border-transparent',
  flex,
  style,
}: {
  backgroundColor?: string
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  flex?: boolean
  disabled?: boolean
  children: React.ReactNode
  textColor?: string | undefined
  borderColor?: string | undefined
  style?: JSX.CSSProperties
}) {
  return (
    <button
      className={`${disabled ? 'opacity-50' : 'cursor-pointer'} text-2xl ${textColor} ${backgroundColor} pt-3 px-4 pb-2 rounded-lg ${flex ? 'flex flex-1' : ''} items-center text-center justify-center border-[1px] ${borderColor}`}
      style={{
        lineHeight: 'normal',
        ...style,
      }}
      onClick={disabled ? () => {} : onClick}
    >
      {children}
    </button>
  )
}
