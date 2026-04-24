export default function RoosterCodeInput({
  error,
  roosterCode,
  setRoosterCode,
}: {
  error: string
  roosterCode: string
  setRoosterCode: (value: string) => void
}) {
  const codeLength = 7

  return (
    <>
      <input
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const target = e.target as HTMLInputElement
          const newValue = target?.value

          if (newValue.length <= codeLength) {
            setRoosterCode(newValue)
          } else {
            setRoosterCode(newValue.slice(0, codeLength))
          }
        }}
        type="text"
        value={roosterCode}
        placeholder="Rooster (cock code)..."
        className={`p-3 rounded-lg bg-moot-green ${roosterCode ? 'text-jet' : 'text-jet-0.6'} text-19 border-[1px] ${error ? 'border-prickly-pink' : roosterCode ? 'border-bright-greek' : 'border-transparent'}`}
        maxLength={codeLength}
      />
      {error && (
        <p
          className="self-start text-prickly-pink text-base"
          style={{
            lineHeight: 'normal',
          }}
        >
          Wrong code, BOK!
        </p>
      )}
    </>
  )
}
