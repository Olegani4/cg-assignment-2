# 3D Scene Viewer and Interaction Tool

An interactive 3D scene viewer built with Three.js that allows users to manipulate and interact with various 3D models and lighting effects.

## Features

### Model Management
- Multiple pre-loaded 3D models (Cat, Human, Male, Female, Duck)
- Dynamic model loading with scale adjustments
- Real-time model manipulation
- Surface analysis and triangle count display
- Support for different texture types (diffuse, normal, bump maps)

### Scene Controls
- Background color customization
- Scene texture options (Sky, Space)
- Surface texture options (Bricks, Grass, Water, Wood)
- Surface visibility toggle
- Ground plane with adjustable textures
- Grid helper for better orientation

### Lighting System
- Ambient and directional lighting
- Dynamic light source addition
- Adjustable light properties:
  - Intensity
  - Distance
  - Decay
  - Color
  - Shadow properties
  - Angle and penumbra

### Interactive Controls
- Orbit controls for camera movement
- Drag controls for object manipulation
- Keyboard navigation (WASD, Arrow keys)
- Mouse selection and interaction
- Real-time property adjustment through GUI

### Material and Texture Management
- Physical-based rendering materials
- Multiple texture types support
- Texture scale adjustment
- Material property controls (metalness, roughness)
- Normal and bump mapping

## Technical Stack

- **Three.js**: Core 3D rendering engine
- **lil-gui**: GUI controls interface
- **Vite**: Development and build tool

## Setup and Installation

1. Clone the repository:
```bash
git clone https://github.com/olegani4/cg-assignment-2.git
cd cg-assignment-2
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Controls

### Camera Controls
- **Mouse Orbit**: Click and drag to rotate view
- **Mouse Wheel**: Zoom in/out
- **Right Click + Drag**: Pan camera
- **WASD/Arrow Keys**: Move camera position

### Object Controls
- **Click**: Select object
- **Drag**: Move selected object
- **GUI Controls**: Adjust object properties
  - Position (X, Y, Z)
  - Rotation (X, Y, Z)
  - Scale
  - Material properties
  - Texture options

### Light Controls
- Add new lights through GUI
- Adjust light properties:
  - Position
  - Intensity
  - Color
  - Shadow parameters

## Project Structure

```
cg-assignment-2/
├── index.html         # Main HTML entry
├── main.js            # Core application logic
├── models/            # 3D model files
│   ├── cat.obj
│   ├── human.obj
│   ├── male.obj
│   ├── female.obj
│   └── duck.obj
├── textures/          # Texture assets
│   ├── diffuse/
│   ├── normal/
│   └── scene/
└── package.json       # Project dependencies
```

## Implementation Details

### Scene Management
- Dynamic object loading and initialization
- Real-time scene updates
- Performance-optimized rendering
- Shadow mapping support

### Material System
- PBR (Physically Based Rendering) materials
- Multiple texture mapping support
- Real-time material property updates

### Interaction System
- Raycaster-based object selection
- Transform controls for object manipulation
- Camera control system with multiple modes

## Performance Considerations

- Optimized texture loading
- Efficient scene graph management
- Shadow map optimization
- Proper disposal of Three.js resources

## Author

Created by [@olegani4](https://github.com/olegani4)