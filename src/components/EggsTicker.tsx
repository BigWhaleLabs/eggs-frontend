import Marquee from 'react-fast-marquee'

export default function EggsTicker({
  direction = 'right',
}: {
  direction?: 'right' | 'left'
}) {
  const eggsArray = Array.from({ length: 100 }, (_, i) => i + 1)

  return (
    <div className="flex w-full">
      <Marquee direction={direction} speed={50} gradient={false}>
        <p style={{ color: '#43FF2A', fontSize: 42, lineHeight: 'normal' }}>
          {eggsArray.map(() => 'EGGS').join('  ')}
        </p>
      </Marquee>
    </div>
  )
}
