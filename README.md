# 3D Engine: Advanced Computer Graphics Project

A WebGL-powered 3D engine built for **IF3260 - Computer Graphics**, offering visualization and manipulation of articulated and hollow models with advanced functionalities like shading, animation, and GPU-powered features.

<p align="center">
  <img src="docs/1.png" alt="3D Engine Preview" style="width: 100%; max-width: 800px; border-radius: 10px;">
</p>

---

## 🖥️ Key Features

### Models
- **Hollow Models:** Single-mesh objects, geometrically defined.
- **Articulated Models:** Multi-mesh objects with hierarchical rigging.
- **Transformations:** Translation, Rotation, and Scaling (TRS) supported for all models.
- **Save/Load Models:** Save model states (colors, textures, transformations) as JSON, and reload them as needed.

### Material & Shading
- **Basic Shading:** Displays ambient light with customizable colors.
- **Phong Shading:** Supports directional light, diffuse/specular mapping, shininess control, and texture mapping.
- **Texture Mapping:**
  - Diffuse, Specular, Displacement, and Normal maps supported.
  - Built-in textures for customization.

### Animation
- Frame-based animations with:
  - **Reverse Mode:** Play animations backward.
  - **Auto-Replay:** Loop animations continuously.
  - **Tweening:** Smooth transitions between frames using easing functions (Linear, Sine, Quad, etc.).
- Frame controls:
  - Play/Pause
  - Step Forward/Backward
  - Jump to First/Last Frame

### Camera
- **Orbit Control:** Mouse and scroll wheel for view manipulation.
- **Projection Modes:** Perspective, Orthographic, and Oblique.
- **Keyboard Controls:** Use WASD for movement.

### Advanced Features
- **Dual Canvas:** Visualize models from two independent camera perspectives.
- **GPU Picking:** Select objects on the canvas using GPU-based ID mapping.
- **Grayscale Postprocessing:** Render scenes with a grayscale effect.

---

## 🏹 Minimum Requirements

- Node.js v20 or later

---

## 🤖 How to Run Locally

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser to access the app.

---

## ✨ How to Use

### Basic Workflow
1. Load a model (hollow or articulated) from the GUI dropdown.
2. Apply transformations (TRS) and customize materials/shading.
3. Save your model to JSON for reuse.

### Animations
- Enable animations for articulated models using the animation tab.
- Adjust FPS and easing functions for smoother transitions.

### Camera Controls
- Adjust FOV and projection type from the camera tab.
- Use the mouse and keyboard for finer control.

---

## Contributors

| Name | NIM | Models | Contributions |
|------|-----|--------|---------------|
| [Yanuar Sano Nur Rasyid](https://github.com/yansans) | 13521110 | Man, Prism | Shading |
| [Ahmad Ghulam Ilham](https://github.com/Agilham) | 13521118 | Drone, Locked-prism | Animation |
| [Saddam Annais Shaquille](https://github.com/SaddamAnnais) | 13521121 | Lamp, Hexagon | Camera |
| [William Nixon](https://github.com/williamnixon20) | 13521123 | Dog, Torus | Components |

---

## Documentation

For detailed usage instructions, refer to the user guide in the `/docs` folder or the [Google Docs guide](https://docs.google.com/document/d/1MoUSaDQ7525uhW5RNgqf-KDxu8huxqRLt37R6cwk_4g/edit).
