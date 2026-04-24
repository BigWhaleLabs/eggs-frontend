import Megapot from 'icons/Megapot'

export default function MegapotTicketsBackground() {
  return (
    <div
      className="pt-3.5 px-4 w-full h-[256px] -mb-50 relative"
      style={{
        background:
          'linear-gradient(180deg, #01C3A0 35.35%, rgba(139, 92, 246, 0.00) 100%)',
      }}
    >
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center text-white gap-4 justify-between">
          <div className="mb-1">
            <Megapot />
          </div>
          <div className="flex flex-col">
            <p className="text-[15px] text-jet -mb-3">EARN</p>
            <p className="text-[21px]">MEGAPOT TICKETS!</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[15px] text-jet -mb-3 uppercase">
            upgrade attempt
          </p>
          <p className="text-[15px] text-jet  uppercase">= 1 ticket</p>
        </div>
      </div>
    </div>
  )
}
