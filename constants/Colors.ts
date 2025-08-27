export const Colors = {
  // Logging Utilities
  log: {
    message: (color: string, message: string) =>
      console.log(`${color}${message}${Colors.Reset}`), // General colored message
    info: (message: string) => Colors.log.message(Colors.FgBlue, message), // Blue for informational logs
    success: (message: string) => Colors.log.message(Colors.FgGreen, message), // Green for success logs
    error: (message: string) =>
      console.error(
        `${Colors.BgRed}${Colors.FgWhite}${message}${Colors.Reset}`,
      ), // White on Red for errors
    highlight: (message: string) =>
      Colors.log.message(`${Colors.BgGreen}${Colors.FgBlack}`, message), // Black on Green for highlights
  },

  // Reset
  Reset: "\x1b[0m", // Resets everything to default
  Bright: "\x1b[1m", // Bold text
  Dim: "\x1b[2m", // Dim (faint) text
  Italic: "\x1b[3m", // Italic text (not widely supported)
  Underscore: "\x1b[4m", // Underlined text
  Blink: "\x1b[5m", // Slow blink
  FastBlink: "\x1b[6m", // Fast blink (not widely supported)
  Reverse: "\x1b[7m", // Invert foreground and background colors
  Hidden: "\x1b[8m", // Hidden text (useful for passwords)
  Strikethrough: "\x1b[9m", // Strikethrough text

  // Standard Foreground Colors
  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",

  // Bright Foreground Colors
  FgBrightBlack: "\x1b[90m",
  FgBrightRed: "\x1b[91m",
  FgBrightGreen: "\x1b[92m",
  FgBrightYellow: "\x1b[93m",
  FgBrightBlue: "\x1b[94m",
  FgBrightMagenta: "\x1b[95m",
  FgBrightCyan: "\x1b[96m",
  FgBrightWhite: "\x1b[97m",

  // Background Colors
  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",

  // Bright Background Colors
  BgBrightBlack: "\x1b[100m",
  BgBrightRed: "\x1b[101m",
  BgBrightGreen: "\x1b[102m",
  BgBrightYellow: "\x1b[103m",
  BgBrightBlue: "\x1b[104m",
  BgBrightMagenta: "\x1b[105m",
  BgBrightCyan: "\x1b[106m",
  BgBrightWhite: "\x1b[107m",

  // Additional Text Effects
  DoubleUnderline: "\x1b[21m", // Double underlined text (not widely supported)
  Overline: "\x1b[53m", // Overlined text (not widely supported)

  // 256 Colors (Foreground)
  FgColor256: (n: number) => `\x1b[38;5;${n}m`, // Foreground color
  BgColor256: (n: number) => `\x1b[48;5;${n}m`, // Background color

  // True Color (RGB) Support
  FgTrueColor: (r: number, g: number, b: number) => `\x1b[38;2;${r};${g};${b}m`, // True color foreground
  BgTrueColor: (r: number, g: number, b: number) => `\x1b[48;2;${r};${g};${b}m`, // True color background
};
