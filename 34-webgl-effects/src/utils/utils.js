const save = ( blob, filename ) => {
  const link = document.createElement( 'a' );
  if ( link.href ) {
    URL.revokeObjectURL( link.href );
  }

  link.href = URL.createObjectURL( blob );
  link.download = filename || 'data.json';
  link.dispatchEvent( new MouseEvent( 'click' ) );
}
export const saveArrayBuffer = ( buffer, filename ) => {
  save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
}
