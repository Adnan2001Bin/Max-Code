"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import gsap from "gsap";

/**
 * 3D Quran Book Opening Animation.
 *
 * Renders a full-screen Three.js scene with a dark-green leather book
 * that opens to reveal its pages, accompanied by floating gold particles.
 * After the animation completes, it fades out revealing the index.
 *
 * Only shown once per session (tracked via sessionStorage).
 */

const INTRO_KEY = "quran-intro-seen";

export function QuranIntro({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  const handleComplete = useCallback(() => {
    setVisible(false);
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // ignore
    }
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Skip if already seen
    try {
      if (sessionStorage.getItem(INTRO_KEY)) {
        handleComplete();
        return;
      }
    } catch {
      // sessionStorage not available
    }

    const container = canvasRef.current;
    if (!container) return;

    // ── Scene setup ──────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a12);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.5, 4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ── Lighting ─────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xfff5e1, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffd699, 1.2);
    mainLight.position.set(2, 4, 3);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.PointLight(0xd4a853, 0.8, 10);
    rimLight.position.set(-2, 2, 1);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x4a6741, 0.3, 10);
    fillLight.position.set(0, -1, 2);
    scene.add(fillLight);

    // ── Materials ────────────────────────────────────
    const coverMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a3a2a,
      roughness: 0.6,
      metalness: 0.15,
    });

    const spineMaterial = new THREE.MeshStandardMaterial({
      color: 0x153020,
      roughness: 0.7,
      metalness: 0.1,
    });

    const pageMaterial = new THREE.MeshStandardMaterial({
      color: 0xfaf5e8,
      roughness: 0.9,
      metalness: 0,
    });

    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a853,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0xd4a853,
      emissiveIntensity: 0.15,
    });

    // ── Book dimensions ──────────────────────────────
    const W = 1.4;
    const H = 2.0;
    const coverThick = 0.06;
    const pageThick = 0.3;

    // ── Book group ───────────────────────────────────
    const bookGroup = new THREE.Group();
    bookGroup.rotation.x = -0.15;
    scene.add(bookGroup);

    // ── Pages (center block) ─────────────────────────
    const pagesGeo = new THREE.BoxGeometry(W - 0.05, H - 0.05, pageThick);
    const pagesMesh = new THREE.Mesh(pagesGeo, pageMaterial);
    pagesMesh.position.set(0, 0, 0);
    pagesMesh.castShadow = true;
    bookGroup.add(pagesMesh);

    // ── Front cover (right side, opens to the left) ───
    const frontPivot = new THREE.Group();
    frontPivot.position.set(-W / 2, 0, 0); // Spine is on the left edge
    bookGroup.add(frontPivot);

    const frontCoverGeo = new THREE.BoxGeometry(W, H, coverThick);
    const frontCover = new THREE.Mesh(frontCoverGeo, coverMaterial);
    frontCover.position.set(W / 2, 0, pageThick / 2 + coverThick / 2);
    frontCover.castShadow = true;
    frontPivot.add(frontCover);

    // Gold border on front cover
    const borderGeo = new THREE.BoxGeometry(W - 0.15, H - 0.15, 0.005);
    const borderMesh = new THREE.Mesh(borderGeo, goldMaterial);
    borderMesh.position.set(W / 2, 0, pageThick / 2 + coverThick + 0.003);
    frontPivot.add(borderMesh);

    // Inner gold border (decorative frame)
    const innerBorderGeo = new THREE.BoxGeometry(W - 0.35, H - 0.35, 0.004);
    const innerBorderMesh = new THREE.Mesh(innerBorderGeo, goldMaterial);
    innerBorderMesh.position.set(
      W / 2,
      0,
      pageThick / 2 + coverThick + 0.004
    );
    frontPivot.add(innerBorderMesh);

    // ── Cover Text ───────────────────────────────────
    const textCanvas = document.createElement("canvas");
    textCanvas.width = 1024;
    textCanvas.height = 2048;
    const tCtx = textCanvas.getContext("2d");
    if (tCtx) {
      tCtx.clearRect(0, 0, 1024, 2048); // transparent background
      tCtx.fillStyle = "#e8c97a"; // Light gold text
      tCtx.textAlign = "center";
      tCtx.textBaseline = "middle";
      // Render text
      tCtx.font = "bold 150px sans-serif";
      tCtx.fillText("القرآن الكريم", 512, 800);
      tCtx.font = "italic 90px sans-serif";
      tCtx.fillText("The Noble Quran", 512, 1000);
    }
    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.needsUpdate = true;
    
    const textMat = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide
    });
    
    const textGeo = new THREE.PlaneGeometry(W, H);
    const textPlane = new THREE.Mesh(textGeo, textMat);
    textPlane.position.set(W / 2, 0, pageThick / 2 + coverThick + 0.008);
    frontPivot.add(textPlane);

    // ── Back cover ───────────────────────────────────
    const backCoverGeo = new THREE.BoxGeometry(W, H, coverThick);
    const backCover = new THREE.Mesh(backCoverGeo, coverMaterial);
    backCover.position.set(0, 0, -(pageThick / 2 + coverThick / 2));
    backCover.castShadow = true;
    backCover.receiveShadow = true;
    bookGroup.add(backCover);

    // ── Spine ────────────────────────────────────────
    const spineGeo = new THREE.BoxGeometry(
      coverThick,
      H,
      pageThick + coverThick * 2
    );
    const spineMesh = new THREE.Mesh(spineGeo, spineMaterial);
    spineMesh.position.set(-W / 2 - coverThick / 2, 0, 0); // Spine on the left side
    bookGroup.add(spineMesh);

    // ── Gold particles ───────────────────────────────
    const particleCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      velocities[i * 3] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 1] = Math.random() * 0.005 + 0.001;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }

    particlesGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: 0xd4a853,
      size: 0.025,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particlesGeo, particleMat);
    scene.add(particles);

    // ── Animation timeline ───────────────────────────
    const tl = gsap.timeline({
      onComplete: () => {
        // Fade out the entire canvas
        gsap.to(container, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            renderer.dispose();
            handleComplete();
          },
        });
      },
    });

    // Initial pause showing closed book
    tl.to({}, { duration: 0.6 });

    // Camera moves slightly closer
    tl.to(
      camera.position,
      {
        z: 3.2,
        y: 0.8,
        duration: 1.5,
        ease: "power2.inOut",
      },
      0.3
    );

    // Book rotates slightly for dramatic angle
    tl.to(
      bookGroup.rotation,
      {
        x: -0.15,
        y: -0.1,
        duration: 1.5,
        ease: "power2.inOut",
      },
      0.3
    );

    // Front cover opens (rotates around left edge via pivot)
    tl.to(
      frontPivot.rotation,
      {
        y: -Math.PI * 0.65,
        duration: 2.0,
        ease: "power3.inOut",
      },
      0.8
    );

    // Light intensifies as book opens
    tl.to(
      mainLight,
      {
        intensity: 2.0,
        duration: 1.5,
        ease: "power2.in",
      },
      1.2
    );

    // Particles become more visible
    tl.to(
      particleMat,
      {
        opacity: 1.0,
        size: 0.04,
        duration: 1.5,
        ease: "power2.in",
      },
      1.5
    );

    // Camera zoom into pages
    tl.to(
      camera.position,
      {
        z: 2.0,
        y: 0.3,
        duration: 1.2,
        ease: "power2.inOut",
      },
      2.5
    );

    // Hold for a moment
    tl.to({}, { duration: 0.5 }, 3.5);

    // ── Render loop ──────────────────────────────────
    let frameId: number;

    function animate() {
      frameId = requestAnimationFrame(animate);

      // Float particles
      const posAttr = particlesGeo.getAttribute("position");
      for (let i = 0; i < particleCount; i++) {
        const arr = posAttr.array as Float32Array;
        arr[i * 3] += velocities[i * 3];
        arr[i * 3 + 1] += velocities[i * 3 + 1];
        arr[i * 3 + 2] += velocities[i * 3 + 2];

        // Reset particles that float too far
        if (arr[i * 3 + 1] > 3) {
          arr[i * 3] = (Math.random() - 0.5) * 8;
          arr[i * 3 + 1] = -3;
          arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
        }
      }
      posAttr.needsUpdate = true;

      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }

    animate();

    // ── Resize handler ───────────────────────────────
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    // ── Skip on click ────────────────────────────────
    function onSkip() {
      tl.progress(1);
    }
    container.addEventListener("click", onSkip);

    // ── Cleanup ──────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("click", onSkip);
      tl.kill();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [handleComplete]);

  if (!visible) return null;

  return (
    <div ref={canvasRef} className="intro-overlay" style={{ cursor: "pointer" }}>
      {/* Skip hint */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(212,168,83,0.5)",
          fontSize: "0.8rem",
          fontFamily: "var(--font-geist-sans)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          zIndex: 201,
          animation: "fadeInUp 1s ease 2s both",
        }}
      >
        Click anywhere to skip
      </div>
    </div>
  );
}
