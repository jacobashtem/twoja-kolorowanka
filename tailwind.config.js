const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    darkMode: false,
    darkmode: "class",
    theme: {
      extend: {
        colors: {
            main: {
                50:  '#fff5f7',
                100: '#ffecef',
                200: '#ffcfd5',
                300: '#ffa4ab',
                400: '#ff6f78',
                500: '#ff454f',
                600: '#e33d46',
                700: '#cb353d',
                800: '#b32d35',
                900: '#9b252c',
              },
              sec: {
                50:  '#f2fcfa',
                100: '#daf9f0',
                200: '#b2f3e1',
                300: '#8bebd1',
                400: '#63e4c1',
                500: '#40ceac',
                600: '#2fa48a',
                700: '#23806c',
                800: '#195a4c',
                900: '#0f372f',
              },
              tertiary: {
                50:  '#faf7fa',
                100: '#f4eef5',
                200: '#e4d4e9',
                300: '#d2b6dc',
                400: '#c294cf',
                500: '#b45eb2', // bazowy kolor
                600: '#9d459d',
                700: '#803280',
                800: '#5d2360',
                900: '#3b153d',
              },
              yellow: {
                50:  '#fff8e7',
                100: '#fff1d0',
                200: '#ffe3a2',
                300: '#ffd675',
                400: '#ffca47',
                500: '#faa000', // bazowy kolor
                600: '#db8c00',
                700: '#bb7300',
                800: '#995a00',
                900: '#734300',
              },
          coolGray: {
            100: "#F3F4F6",
            200: "#E5E7EB",
            300: "#D1D5DB",
            400: "#9CA3AF",
            500: "#6B7280",
            600: "#4B5563",
            700: "#374151",
            800: "#1F2937",
            900: "#111827",
          },        
        },
        fontFamily: {
        modak: ['Modak', ...defaultTheme.fontFamily.sans],
      },
        listStyleType: {
          none: 'none',
          disc: 'disc',
          decimal: 'decimal',
          square: 'square',
          roman: 'upper-roman',
        },
        screens: {
          xs: "480px",
          xxs: "320px",
        },
      },
    },
  };
  