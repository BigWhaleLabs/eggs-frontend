export default function Arrow({
  direction = 'right',
  smol = false,
  color = '#2A3FFF',
}: {
  direction?: 'left' | 'right' | 'up' | 'down'
  smol?: boolean
  color?: string
}) {
  let style = 'none'
  if (direction === 'left') {
    style = 'rotate(180deg)'
  } else if (direction === 'up') {
    style = 'rotate(-90deg)'
  } else if (direction === 'down') {
    style = 'rotate(90deg)'
  }
  return (
    <svg
      width={smol ? '8' : '11'}
      height={smol ? '15' : '18'}
      viewBox="0 0 11 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: style }}
    >
      <path
        d="M0.999999 17L9 9L1 1"
        stroke={color}
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  )
}
