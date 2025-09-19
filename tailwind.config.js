module.exports = {
  content: [
    "./*.html",
    "./feed/*.html",
    "./profile/*.html",
    "./scripts/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#568DA0',
        accent:  '#BAE2DF',
        textDark:'#264653',
        textLight:'#F0F4F3',
        brand:     '#3D7D75',
        brandDark: '#33665f',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [
    
  ],
};
