# Theme Persistence Bug Fix

## Problem
Custom theme selection was not persisting. When a user selected "Night Sky" in Settings, it would revert to the default "Dark" theme when navigating away or returning to Settings.

## Root Cause
The application had **two completely separate and disconnected theme systems**:

1. **Main Theme System** (`src/lib/theme.js`)
   - Stores data in: `'theme-preset'` localStorage key
   - Uses theme keys: `'theme-night-sky'`, `'theme-aquatic'`, etc.
   - Integrated with `ThemeToggle.jsx` component
   - Used `useTheme()` hook

2. **Settings Component System** (`src/components/dashboard/Settings.jsx`)
   - Stores data in: `'academee_contrast_preset'` localStorage key
   - Uses preset IDs: `'night-sky'`, `'aquatic'`, etc.
   - Completely independent implementation
   - Did not use the main theme system

**Result**: When you selected a theme in Settings, it stored the selection in its own localStorage key. When you navigated away and returned, the Settings component read from its own storage (which might not match what the main theme system applied), causing the mismatch.

## Solution
Unified both systems by making Settings use the main theme system:

### Changes Made

1. **Import theme dependencies**
   ```js
   import { applyAccessibilityPreferences, CUSTOM_THEMES } from '../../lib/theme'
   import useTheme from '../../lib/useTheme'
   ```

2. **Map presets to theme keys**
   - Added `themeKey` property to each preset
   - `'night-sky'` preset now maps to `'theme-night-sky'` theme key

3. **Sync Settings with main theme system**
   ```js
   const { customTheme, setThemePreset, setMode } = useTheme()
   ```

4. **Update state when theme changes externally**
   ```js
   useEffect(() => {
     setPrefs((current) => ({
       ...current,
       contrastPreset: readStoredPrefs(customTheme).contrastPreset,
     }))
   }, [customTheme])
   ```

5. **Call theme system methods when selecting preset**
   ```js
   const selectPreset = (presetId) => {
     const preset = PRESETS.find((p) => p.id === presetId)
     if (!preset) return
     
     if (prefs.contrastPreset === presetId) {
       // Deselect: go back to original
       setMode('system')
     } else {
       // Select new preset
       setThemePreset(preset.themeKey)
     }
   }
   ```

6. **Remove legacy storage key**
   - Removed line: `window.localStorage.setItem(PRESET_KEY, prefs.contrastPreset)`
   - Now only Settings stores in `STORAGE_KEY` for accessibility prefs
   - Theme storage is managed by `theme.js`

## Data Flow After Fix

```
Settings.jsx
    ↓
selectPreset() → setThemePreset('theme-night-sky')
    ↓
theme.js: setThemePreset()
    ↓
persistThemeState() → localStorage['theme-preset'] = 'theme-night-sky'
    ↓
applyThemeToDocument() → document.documentElement.classList.add('theme-night-sky')
    ↓
Theme applied across entire application ✓

Navigate away and return to Settings
    ↓
useTheme() hook provides current customTheme = 'theme-night-sky'
    ↓
readStoredPrefs(customTheme) → matches preset → contrastPreset = 'night-sky'
    ↓
UI displays correct selection ✓
```

## Files Modified
- `src/components/dashboard/Settings.jsx` - Integrated with main theme system

## Testing

### Test Case 1: Select and Persist Theme
1. Go to Settings > Appearance
2. Click "Night Sky" theme
3. Navigate away from Settings
4. Return to Settings
5. ✅ **Expected**: "Night Sky" should remain selected

### Test Case 2: Switch Between Themes
1. Select "Aquatic"
2. Navigate away
3. Return
4. ✅ **Expected**: "Aquatic" should be selected
5. Select "Desert"
6. Navigate away
7. Return
8. ✅ **Expected**: "Desert" should be selected

### Test Case 3: Theme Toggle from ThemeToggle Component
1. Select "Night Sky" in Settings
2. Navigate away
3. Use ThemeToggle component dropdown to select "Dusk"
4. Return to Settings
5. ✅ **Expected**: "Dusk" should be selected

### Test Case 4: Accessibility Preferences Still Work
1. Toggle "Large Text" in Settings
2. Navigate away
3. Return to Settings
4. ✅ **Expected**: "Large Text" should still be enabled
5. Reset all preferences
6. ✅ **Expected**: All accessibility prefs reset + theme resets to "System"

## Related Files
- `src/lib/theme.js` - Main theme system (unchanged)
- `src/components/ThemeToggle.jsx` - Uses main theme system (unchanged)
- `src/lib/AuthProvider.jsx` - No changes needed
- CSS theme variables - No changes needed

## Benefits
- ✅ Single source of truth for theme state
- ✅ Theme selection persists correctly
- ✅ Consistent behavior across application
- ✅ Easier to maintain in the future
- ✅ No duplicate localStorage keys
- ✅ Works with dark mode, system preference, and custom themes
