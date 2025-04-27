module.exports = {
  content: [
    "./index.html",
    "./feed/**/*.html",
    "./profile/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#568DA0',        // calm blue-green
        accent: '#BAE2DF',         // light mint
        textDark: '#264653',       // deep earthy
        textLight: '#F0F4F3'       // soft background
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif']
      }
    }
  },
  plugins: [],
}
