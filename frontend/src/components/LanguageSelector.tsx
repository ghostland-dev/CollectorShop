import { MenuItem, Select, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Language } from '@mui/icons-material';

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleChange = (event: SelectChangeEvent<string>) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
      <InputLabel id="language-selector-label" aria-label="Sélecteur de langue">
        Langue
      </InputLabel>
      <Select
        labelId="language-selector-label"
        id="language-selector"
        value={i18n.language}
        label="Langue"
        onChange={handleChange}
        startAdornment={<Language sx={{ mr: 1, fontSize: 20 }} />}
        aria-label="Changer la langue de l'interface"
        aria-describedby="language-selector-description"
      >
        <MenuItem value="fr" aria-label="Français">🇫🇷 Français</MenuItem>
        <MenuItem value="en" aria-label="English">🇬🇧 English</MenuItem>
      </Select>
      <span id="language-selector-description" className="sr-only">
        Sélectionnez votre langue préférée pour l'interface
      </span>
    </FormControl>
  );
}

