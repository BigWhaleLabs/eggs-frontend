export default function TimerWave() {
  return (
    <svg
      className="w-full"
      height="79"
      preserveAspectRatio="xRepeat slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="wave-pattern"
          x="0"
          y="0"
          width="393"
          height="79"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 0H393V69L363.822 74.9395C350.659 77.619 337.091 77.619 323.928 74.9395L314.697 73.0605C301.534 70.381 287.966 70.381 274.803 73.0605L265.572 74.9395C252.409 77.619 238.841 77.619 225.678 74.9395L216.447 73.0605C203.284 70.381 189.716 70.381 176.553 73.0605L167.322 74.9395C154.159 77.619 140.591 77.619 127.428 74.9395L118.197 73.0605C105.034 70.381 91.466 70.381 78.303 73.0605L69.072 74.9395C55.909 77.619 42.341 77.619 29.178 74.9395L0 69V0Z"
            fill="#FFB700"
          />
        </pattern>
      </defs>

      <rect width="100%" height="79" fill="url(#wave-pattern)" />
    </svg>
  )
}
