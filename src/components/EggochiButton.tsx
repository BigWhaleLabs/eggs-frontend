import { selectedHenAtom } from 'atoms/eggochiAtom'
import EggButtonBase from 'icons/EggButtonBase'
import { useAtom } from 'jotai'

export default function EggochiButton({
  henNumber,
  actualHenNumber,
}: {
  henNumber: number
  actualHenNumber: number
}) {
  const [selectedHen, setSelectedHen] = useAtom(selectedHenAtom)

  return (
    <button
      onClick={() => {
        setSelectedHen(actualHenNumber)
      }}
      className="cursor-pointer relative"
    >
      <EggButtonBase active={selectedHen === actualHenNumber} />
      <p
        className={`absolute ${selectedHen === actualHenNumber ? 'text-[#373330]' : 'text-silver-spoon'}`}
        style={{
          fontSize: 21,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {henNumber}
      </p>
    </button>
  )
}
