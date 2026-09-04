export function Lights() {
  return (
    <>
      {/* базовый рассеянный свет — ярко, чтобы всё читалось */}
      <ambientLight intensity={1.05} color={0xcdd6ff} />
      <hemisphereLight intensity={0.7} color={0xb9c6ff} groundColor={0x3a2b4d} />

      {/* основной направленный свет с мягкими тенями */}
      <directionalLight
        castShadow
        position={[5, 7, 3]}
        intensity={1.5}
        color={0xfff1dc}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-5, 6, -3]} intensity={0.7} color={0xa9c4ff} />

      {/* рабочие зоны над столами */}
      <pointLight position={[-3.4, 2.4, -2.2]} intensity={14} distance={7} decay={1.7} color={0xdfe9ff} />
      <pointLight position={[-0.2, 2.4, -1.8]} intensity={14} distance={7} decay={1.7} color={0xdfe9ff} />
      <pointLight position={[-0.2, 2.2, -1.0]} intensity={10} distance={6} decay={1.7} color={0xdfe9ff} />
      <pointLight position={[4.2, 2.4, -1.2]} intensity={14} distance={7} decay={1.7} color={0xdfe9ff} />
      <pointLight position={[0, 2.4, 1.0]} intensity={14} distance={7} decay={1.7} color={0xdfe9ff} />

      {/* цветовые акценты */}
      <pointLight position={[4.4, 1.6, 2.3]} intensity={9} distance={6} decay={1.8} color={0x17e8d0} />
      <pointLight position={[5, 1.9, -1.4]} intensity={8} distance={6} decay={1.8} color={0x7a5cff} />
      <pointLight position={[0, 1.6, 2.2]} intensity={9} distance={6} decay={1.8} color={0xff5cae} />
      <pointLight position={[-3.2, 2.0, 2.2]} intensity={7} distance={6} decay={1.8} color={0xff5cae} />
    </>
  );
}
