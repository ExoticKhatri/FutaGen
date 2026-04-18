# FutaGen - Random Demon Lady Generator ✨😇

A fun little project I built because I can. This generates highly detailed prompts for creating random anime-style demon ladies (perfect for all you Melovela lovers out there).

## What is this?

Tired of manually creating character prompts? This tool generates randomized demon girl characters with customizable traits, making it easy to create unique characters for your AI image generation needs.

**Current State**: Prompt generation only (no direct image generation yet - but you can take the generated prompts and feed them into free APIs like Google Gemini for image generation).

## Example Output

![Generated Demon Ladies](public/Group%2016.png)

## How to Use

1. Run the dev server:
```bash
bun run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Use the interface to generate random demon lady prompts

4. Copy the generated prompt and use it with your favorite free AI image generator (like Google Gemini)

5. Optionally, provide reference images from the `public/` folder for style inspiration

## Quick Start Example

Want to see it in action? Here's the quickest way:

1. **Try the app** at [https://futa-gen.vercel.app/](https://futa-gen.vercel.app/)
2. **Generate a prompt** - Click the generate button and copy the prompt text
3. **Grab the reference images** - Use the two images in the `public/` folder (`refrence1.jpg` and `refrence2.jpg`)
4. **Open Google Gemini** - Go to [gemini.google.com](https://gemini.google.com)
5. **Upload & Generate** - Upload the two reference images + paste your prompt
6. **Boom! 💥** - You've got your demon lady generated!

## Features

### Current Features ✅
- **Random Trait Generation**: Generates random demon girl characters with varied traits
- **Prompt Building**: Creates detailed, structured prompts optimized for AI image generation
- **Interactive UI**: Clean interface to customize and regenerate prompts
- **Reference Support**: Use provided reference images for art style inspiration

### Upcoming Features 🚀
- **Add/Delete Traits**: Customize the trait pool to create your own demon lady archetypes
- **Dependent Traits**: Create trait relationships (e.g., certain horns only appear with specific hair styles)
- **Library Section**: Save and manage your favorite generated character prompts
- **Direct Image Generation**: Actual image generation integration (once we're not broke 😅)

## Project Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Google Generative AI** - API integration (for future image generation)
- **Framer Motion** - Smooth animations

## File Structure

```
├── app/              # Next.js app directory
├── components/       # React components
├── actions/          # Server actions
├── data/             # Trait data files
├── utils/            # Helper functions
├── public/           # Reference images
└── ref/              # Reference prompts and examples
```

## Getting Started

### Prerequisites
- Node.js 18+
- bun

### Installation

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun build

# Start production server
bun start
```

## Notes

This is a hobby project, so don't expect professional-grade code or features. It's built for fun and iteration. Currently limited by budget (hence no paid API integration), but the prompt generation works great with free tier services.

## Contributing

It's just a personal project, but if you want to fork it and make improvements, go for it! 🎉

---

**For all Melevola lovers out there** 💜
