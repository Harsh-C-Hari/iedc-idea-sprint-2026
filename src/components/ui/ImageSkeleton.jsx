/**
 * ImageSkeleton — reserves space (zero CLS), shows a brand-toned shimmer, and fades the real
 * image in once decoded. Only transform + opacity are animated.
 * Fail-safes: cached images resolve on mount; load error swaps to a neutral panel (never a blank
 * hole); reduced motion = static tint + instant swap (handled in CSS).
 */
import { useState, useRef, useEffect } from 'react'

export default function ImageSkeleton({
  base,            // e.g. '/images/cec-map'
  widths,          // e.g. [640, 1024, 1200]
  sizes = '100vw',
  alt,
  width,
  height,
  className = '',
  imgClassName = '',
  fetchPriority = 'low',
}) {
  const [state, setState] = useState('loading') // loading | loaded | error
  const ref = useRef(null)

  useEffect(() => {
    const img = ref.current
    if (img?.complete) setState(img.naturalWidth > 0 ? 'loaded' : 'error')
  }, [])

  const set = (ext) => widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ')
  const largest = widths[widths.length - 1]

  return (
    <div
      className={`img-skel ${state === 'loaded' ? 'is-loaded' : ''} ${state === 'error' ? 'is-error' : ''} ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
      data-state={state}
    >
      <picture>
        <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
        <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
        <img
          ref={ref}
          src={`${base}-${largest}.jpg`}
          srcSet={set('jpg')}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          fetchPriority={fetchPriority}
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={`img-skel__img ${imgClassName}`}
        />
      </picture>
    </div>
  )
}
