import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			/**
  			 * Conceev Digital brand face. Helvetica Neue first so Apple devices
  			 * get the real brand font; Inter is the cross-platform equivalent.
  			 */
  			brand: [
  				'Helvetica Neue',
  				'Inter',
  				'Helvetica',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Arial',
  				'sans-serif'
  			],
  			sans: [
  				'Roboto',
  				'ui-sans-serif',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Helvetica Neue',
  				'Arial',
  				'Noto Sans',
  				'sans-serif'
  			],
  			serif: [
  				'Libre Caslon Text',
  				'ui-serif',
  				'Georgia',
  				'Cambria',
  				'Times New Roman',
  				'Times',
  				'serif'
  			],
  			mono: [
  				'Roboto Mono',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			navy: {
  				DEFAULT: 'hsl(var(--navy))',
  				light: 'hsl(var(--navy-light))'
  			},
  			'blue-light': 'hsl(var(--blue-light))',
  			'blue-glow': 'hsl(var(--blue-glow))',
  			'green-success': 'hsl(var(--green-success))',
  			/**
  			 * Conceev Digital Identity palette (Identity Guidelines, pg. 9–10).
  			 *
  			 * Added as an explicit, opt-in scale rather than by overwriting the
  			 * global --primary token: the rest of the site (30+ pages, admin and
  			 * role dashboards) still runs on the existing orange/navy system, and
  			 * repointing --primary would restyle all of it at once.
  			 *
  			 *   Primary (digital):   black #191717, red #C40233
  			 *   Secondary (digital): grey #C9C9C9, off-white #F4F4F4
  			 *   Gradient palette:    green #16EB9E, blue #0048E7
  			 *
  			 * Green and blue appear in the guidelines only under Gradient, so they
  			 * are used sparingly here as status/technology accents, never as a
  			 * dominant surface colour.
  			 *
  			 * `ink`, `red-deep` and `grey-mid` are NOT new brand colours: they are
  			 * derived UI states computed from the two primaries — #0F0E0E is
  			 * #191717 darkened 40%, #9E0229 is #C40233 darkened 20%, and #6E6B6B is
  			 * #191717 at ~63% over white (used where a flat neutral is needed at
  			 * WCAG-AA contrast).
  			 */
  			conceev: {
  				black: '#191717',
  				ink: '#0F0E0E',
  				red: '#C40233',
  				'red-deep': '#9E0229',
  				grey: '#C9C9C9',
  				'grey-mid': '#6E6B6B',
  				offwhite: '#F4F4F4',
  				green: '#16EB9E',
  				blue: '#0048E7'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'2xl': '1.5rem'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-8px)'
  				}
  			},
  			'rise-in': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(14px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'pulse-dot': {
  				'0%, 100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				},
  				'50%': {
  					opacity: '0.55',
  					transform: 'scale(0.85)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.6s ease-out forwards',
  			float: 'float 3s ease-in-out infinite',
  			'rise-in': 'rise-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards',
  			'pulse-dot': 'pulse-dot 2s ease-in-out infinite'
  		},
  		backgroundImage: {
  			/*
  			 * Brand gradient, per Identity Guidelines pg. 10: shifts left to
  			 * right at a 60 degree angle, Black to Red.
  			 *
  			 * Built from brand colours only — the guideline states gradients must
  			 * use the primary colours and must not use the secondary greys. Any
  			 * intermediate stop would introduce a colour that is not in the
  			 * palette, so this is a clean two-stop black → red ramp.
  			 */
  			'conceev-gradient': 'linear-gradient(60deg, #191717 0%, #C40233 100%)'
  		},
  		boxShadow: {
  			'2xs': 'var(--shadow-2xs)',
  			xs: 'var(--shadow-xs)',
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
