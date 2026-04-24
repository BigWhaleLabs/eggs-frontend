export default function EggButtonBase({
  active,
  id,
}: {
  active?: boolean
  id?: string
}) {
  // Generate a unique ID suffix if not provided
  const uniqueId = id || `egg-${Math.random().toString(36).substring(2, 10)}`

  if (active) {
    return (
      <svg
        width="50"
        height="51"
        viewBox="0 0 50 51"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter={`url(#filter0_d_${uniqueId})`}>
          <g filter={`url(#filter1_d_${uniqueId})`}>
            <circle
              cx="25.0594"
              cy="25.0598"
              r="16.1736"
              fill={`url(#paint0_linear_${uniqueId})`}
            />
          </g>
          <g opacity="0.3" filter={`url(#filter2_f_${uniqueId})`}>
            <path
              d="M37.9387 21.0743C35.3845 17.0138 30.5736 14.2774 25.0597 14.2774C19.5458 14.2774 14.7349 17.0138 12.1807 21.0743C13.8801 15.5763 19.0034 11.5818 25.0597 11.5818C31.116 11.5818 36.2393 15.5763 37.9387 21.0743Z"
              fill={`url(#paint1_linear_${uniqueId})`}
            />
          </g>
          <g filter={`url(#filter3_f_${uniqueId})`}>
            <path
              d="M37.9387 29.1032C35.3845 33.1637 30.5736 35.9001 25.0597 35.9001C19.5458 35.9001 14.7349 33.1637 12.1807 29.1031C13.8801 34.6012 19.0034 38.5957 25.0597 38.5957C31.116 38.5957 36.2393 34.6012 37.9387 29.1032Z"
              fill={`url(#paint2_linear_${uniqueId})`}
            />
          </g>
          <g
            style={{ mixBlendMode: 'difference' }}
            filter={`url(#filter4_d_${uniqueId})`}
          >
            <circle cx="25.0594" cy="25.0598" r="16.1736" fill="#FFB700" />
          </g>
        </g>
        <defs>
          <filter
            id={`filter0_d_${uniqueId}`}
            x="-10"
            y="-10"
            width="70"
            height="71"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="2.9956" />
            <feGaussianBlur stdDeviation="1.4978" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_113_51769"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_113_51769"
              result="shape"
            />
          </filter>
          <filter
            id={`filter1_d_${uniqueId}`}
            x="-4"
            y="-1"
            width="58"
            height="58"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="2.9956" />
            <feGaussianBlur stdDeviation="1.4978" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_113_51769"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_113_51769"
              result="shape"
            />
          </filter>
          <filter
            id={`filter2_f_${uniqueId}`}
            x="10.6829"
            y="10.084"
            width="28.7534"
            height="12.4882"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="0.748901"
              result="effect1_foregroundBlur_113_51769"
            />
          </filter>
          <filter
            id={`filter3_f_${uniqueId}`}
            x="10.6829"
            y="27.6053"
            width="28.7534"
            height="12.4882"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="0.748901"
              result="effect1_foregroundBlur_113_51769"
            />
          </filter>
          <filter
            id={`filter4_d_${uniqueId}`}
            x="-4"
            y="-1"
            width="58"
            height="58"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="2.9956" />
            <feGaussianBlur stdDeviation="1.4978" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_113_51769"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_113_51769"
              result="shape"
            />
          </filter>
          <linearGradient
            id={`paint0_linear_${uniqueId}`}
            x1="25.0594"
            y1="8.88623"
            x2="25.0594"
            y2="41.2335"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#494440" />
            <stop offset="1" stopColor="#252220" />
          </linearGradient>
          <linearGradient
            id={`paint1_linear_${uniqueId}`}
            x1="25.0597"
            y1="11.5818"
            x2="25.0597"
            y2="38.5379"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#CCCCCC" />
            <stop offset="1" stopColor="#1F1C1A" />
          </linearGradient>
          <linearGradient
            id={`paint2_linear_${uniqueId}`}
            x1="25.0597"
            y1="38.5957"
            x2="25.0597"
            y2="11.6396"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#121212" />
            <stop offset="1" stopColor="#1F1C1A" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  return (
    <svg
      width="50"
      height="51"
      viewBox="0 0 50 51"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.7" filter={`url(#filter0_f_${uniqueId}_inactive)`}>
        <circle
          cx="25"
          cy="25"
          r="22"
          fill={`url(#paint0_linear_${uniqueId}_inactive)`}
        />
      </g>
      <g filter={`url(#filter1_d_${uniqueId}_inactive)`}>
        <g filter={`url(#filter2_d_${uniqueId}_inactive)`}>
          <circle
            cx="25.0594"
            cy="25.0598"
            r="16.1736"
            fill={`url(#paint1_linear_${uniqueId}_inactive)`}
          />
        </g>
        <g opacity="0.3" filter={`url(#filter3_f_${uniqueId}_inactive)`}>
          <path
            d="M37.9387 21.0743C35.3845 17.0138 30.5736 14.2774 25.0597 14.2774C19.5458 14.2774 14.7349 17.0138 12.1807 21.0743C13.8801 15.5763 19.0034 11.5818 25.0597 11.5818C31.116 11.5818 36.2393 15.5763 37.9387 21.0743Z"
            fill={`url(#paint2_linear_${uniqueId}_inactive)`}
          />
        </g>
        <g filter={`url(#filter4_f_${uniqueId}_inactive)`}>
          <path
            d="M37.9387 29.1032C35.3845 33.1637 30.5736 35.9001 25.0597 35.9001C19.5458 35.9001 14.7349 33.1637 12.1807 29.1031C13.8801 34.6012 19.0034 38.5957 25.0597 38.5957C31.116 38.5957 36.2393 34.6012 37.9387 29.1032Z"
            fill={`url(#paint3_linear_${uniqueId}_inactive)`}
          />
        </g>
      </g>
      <defs>
        <filter
          id={`filter0_f_${uniqueId}_inactive`}
          x="-10"
          y="-10"
          width="70"
          height="70"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="1.4978"
            result="effect1_foregroundBlur_113_51754"
          />
        </filter>
        <filter
          id={`filter1_d_${uniqueId}_inactive`}
          x="-4"
          y="-1"
          width="58"
          height="58"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.9956" />
          <feGaussianBlur stdDeviation="1.4978" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_113_51754"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_113_51754"
            result="shape"
          />
        </filter>
        <filter
          id={`filter2_d_${uniqueId}_inactive`}
          x="-4"
          y="-1"
          width="58"
          height="58"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.9956" />
          <feGaussianBlur stdDeviation="1.4978" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_113_51754"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_113_51754"
            result="shape"
          />
        </filter>
        <filter
          id={`filter3_f_${uniqueId}_inactive`}
          x="10.6829"
          y="10.084"
          width="28.7534"
          height="12.4882"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="0.748901"
            result="effect1_foregroundBlur_113_51754"
          />
        </filter>
        <filter
          id={`filter4_f_${uniqueId}_inactive`}
          x="10.6829"
          y="27.6053"
          width="28.7534"
          height="12.4882"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="0.748901"
            result="effect1_foregroundBlur_113_51754"
          />
        </filter>
        <linearGradient
          id={`paint0_linear_${uniqueId}_inactive`}
          x1="36.4156"
          y1="9.24248"
          x2="5.20323"
          y2="18.0554"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9C7A77" />
          <stop offset="1" stopColor="#D4CDCD" />
        </linearGradient>
        <linearGradient
          id={`paint1_linear_${uniqueId}_inactive`}
          x1="25.0594"
          y1="8.88623"
          x2="25.0594"
          y2="41.2335"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#494440" />
          <stop offset="1" stopColor="#252220" />
        </linearGradient>
        <linearGradient
          id={`paint2_linear_${uniqueId}_inactive`}
          x1="25.0597"
          y1="11.5818"
          x2="25.0597"
          y2="38.5379"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CCCCCC" />
          <stop offset="1" stopColor="#1F1C1A" />
        </linearGradient>
        <linearGradient
          id={`paint3_linear_${uniqueId}_inactive`}
          x1="25.0597"
          y1="38.5957"
          x2="25.0597"
          y2="11.6396"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#121212" />
          <stop offset="1" stopColor="#1F1C1A" />
        </linearGradient>
      </defs>
    </svg>
  )
}
