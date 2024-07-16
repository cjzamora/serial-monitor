module.exports = function({ addComponents, theme }) {
  const buttons = {
    '.btn': {
      padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
      borderRadius: theme('borderRadius.md'),
      fontSize: theme('fontSize.sm'),
      fontWeight: theme('fontWeight.bold'),
      cursor: 'pointer',
      '&:hover': {
        opacity: 0.8
      }
    },
    '.btn-outline': {
      backgroundColor: 'transparent',
      border: `1px solid ${theme('colors.gray.300')}`,
      color: theme('colors.gray.800'),
      '&:hover': {
        backgroundColor: theme('colors.gray.100')
      }
    },
    
    '.btn-xl': {
      padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
      fontSize: theme('fontSize.lg')
    },
    '.btn-2xl': {
      padding: `${theme('spacing.4')} ${theme('spacing.8')}`,
      fontSize: theme('fontSize.2xl')
    },
    '.btn-lg': {
      padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
      fontSize: theme('fontSize.lg')
    },
    
    '.btn-dark': {
      backgroundColor: theme('colors.gray.800'),
      color: theme('colors.white'),
      '&:hover': {
        backgroundColor: theme('colors.gray.900')
      }
    }
  }

  addComponents(buttons);
}