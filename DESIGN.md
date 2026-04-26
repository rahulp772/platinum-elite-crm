---
name: Platinum Elite
colors:
  primary: "#C5A059"
  secondary: "#1E293B"
  surface: "#0F172A"
  on-surface: "#F8FAFC"
  accent: "#D4AF37"
  error: "#E11D48"
typography:
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
rounded:
  md: 6px
  lg: 8px
---

# Design System

## Overview
A premium, sophisticated "Platinum Elite" interface designed for high-end real estate management. 
It features a deep navy palette with champagne gold accents, glassmorphism, and subtle glow effects to convey luxury and exclusivity.

## Colors
- **Primary (Gold)** (#C5A059): Active states, primary CTAs, and brand highlights.
- **Secondary (Slate/Navy)** (#1E293B): Sidebars, muted backgrounds, and supporting UI elements.
- **Surface (Deep Navy)** (#0F172A): Main application background and card foundations.
- **On-surface (White/Slate)** (#F8FAFC): Primary text and high-contrast labels.
- **Accent (Champagne Gold)** (#D4AF37): Decorative elements, icons, and special highlights.
- **Error (Rose/Red)** (#E11D48): Validation errors and destructive actions.

## Typography
- **Headlines**: Inter, bold or semi-bold, with high letter-spacing for a premium feel.
- **Body**: Inter, regular, 14–16px for optimal readability on dark surfaces.
- **Labels**: Inter, medium, 12px, often uppercase for section headers or navigation.

## Components
- **Buttons**: Rounded (8px), often using gold gradients or glass effects.
- **Cards**: "Glass" effect with `backdrop-blur` and subtle borders. Often features a "glow" shadow when active or featured.
- **Inputs**: 1px border with HSL(217.2, 32.6%, 17.5%), subtle focus ring in gold.
- **Visual Effects**: 
  - **Glassmorphism**: `.glass` and `.glass-card` for translucent, blurred backgrounds.
  - **Glows**: Subtle amber-tinted shadows (`.glow-md`) for highlighting premium data.
  - **Gradients**: Linear gold gradients for high-impact text or buttons.

## Do's and Don'ts
- **Do** use the gold primary color for luxury branding elements and key actions.
- **Do** leverage glassmorphism for layered UI elements to maintain depth.
- **Don't** over-use the glow effects; keep them reserved for "Featured" or "Active" items.
- **Do** maintain high contrast (at least 4.5:1) even on dark navy backgrounds.
- **Don't** use sharp corners; adhere to the 6px-8px rounding for a softer, modern look.
