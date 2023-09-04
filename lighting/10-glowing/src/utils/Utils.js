
export const easeOutCubic = function ( t ) {
  return ( -- t ) * t * t + 1;
};
export const scaleCurve = function ( t ) {
  return Math.abs( easeOutCubic( ( t > 0.5 ? 1 - t : t ) * 2 ) );
}
