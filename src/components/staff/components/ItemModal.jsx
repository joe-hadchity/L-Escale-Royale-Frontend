// components/ItemModal.jsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import OnScreenKeyboard from '../../common/OnScreenKeyboard'; // Adjust the import path as needed

const ItemModal = ({
  open,
  onClose,
  selectedItem,
  removals,
  addOns,
  ingredientsCategories,
  availableIngredients,
  selectedIngredientCategory,
  toggleRemoveIngredient,
  toggleAddIngredient,
  handleIngredientCategoryChange,
  handleSaveItem,
  note,
  setNote,
  isOnTheHouse,     // Include this prop
  setIsOnTheHouse,  // Include this prop
}) => {
  const [activeTab, setActiveTab] = useState('remove');
  const [showKeyboard, setShowKeyboard] = useState(false);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem' }}
      >
        Edit {selectedItem?.Name}
      </DialogTitle>

      <DialogContent dividers sx={{ paddingX: 3, paddingY: 2 }}>
        {/* Toggle Button Group to Switch Between Tabs */}
        <ToggleButtonGroup
          value={activeTab}
          exclusive
          onChange={(e, newTab) => {
            if (newTab !== null) {
              setActiveTab(newTab);
              if (newTab !== 'add') {
                handleIngredientCategoryChange(''); // Reset selected ingredient category when not in 'add' tab
              }
            }
          }}
          sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}
        >
          <ToggleButton
            value="remove"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.2rem',
              padding: '10px 20px',
            }}
          >
            Remove Ingredients
          </ToggleButton>
          <ToggleButton
            value="add"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.2rem',
              padding: '10px 20px',
            }}
          >
            Add Ingredients
          </ToggleButton>
          <ToggleButton
            value="notes"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.2rem',
              padding: '10px 20px',
            }}
          >
            Notes
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Remove Ingredients Section */}
        {activeTab === 'remove' && (
          <Box>
            <Typography
              variant="h6"
              sx={{
                mt: 2,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '1.3rem',
              }}
            >
              Remove Ingredients
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                mt: 2,
                justifyContent: 'center',
                maxHeight: '300px',
                overflowY: 'auto',
                padding: 2,
                backgroundColor: '#f9f9f9',
                borderRadius: 2,
              }}
            >
              {selectedItem?.Ingredients?.map((ingredient, index) => (
                <Chip
                  key={index}
                  label={ingredient.Name}
                  color={removals.includes(ingredient.Name) ? 'error' : 'default'}
                  onClick={() => toggleRemoveIngredient(ingredient.Name)}
                  sx={{
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '10px 15px',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Add Ingredients Section */}
        {activeTab === 'add' && (
          <Box>
            <Typography
              variant="h6"
              sx={{
                mt: 2,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '1.3rem',
              }}
            >
              Add Ingredients
            </Typography>

            {/* Ingredient Categories */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                mt: 2,
                mb: 2,
              }}
            >
              {ingredientsCategories.map((cat, index) => (
                <Button
                  key={index}
                  variant={
                    selectedIngredientCategory === cat.categoryName
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() =>
                    handleIngredientCategoryChange(cat.categoryName)
                  }
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    padding: '10px 20px',
                    borderRadius: '12px',
                  }}
                >
                  {cat.categoryName}
                </Button>
              ))}
            </Box>

            {/* Available Ingredients */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                mt: 2,
                justifyContent: 'center',
                maxHeight: '300px',
                overflowY: 'auto',
                padding: 2,
                backgroundColor: '#f9f9f9',
                borderRadius: 2,
              }}
            >
              {availableIngredients.map((ingredient, index) => (
                <Chip
                  key={index}
                  label={`${ingredient.Name}: ${ingredient.Price} CFA`}
                  color={addOns.includes(ingredient.Name) ? 'primary' : 'default'}
                  onClick={() => toggleAddIngredient(ingredient.Name)}
                  sx={{
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '10px 15px',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Notes Section */}
        {activeTab === 'notes' && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '1.3rem',
              }}
            >
              Add a Note
            </Typography>
            <TextField
              label="Note"
              multiline
              fullWidth
              rows={4}
              value={note}
              onClick={() => setShowKeyboard(true)}
              onChange={(e) => setNote(e.target.value)}
              sx={{ mt: 2 }}
            />
            {showKeyboard && (
              <OnScreenKeyboard
                value={note}
                onChange={(value) => setNote(value)}
                onClose={() => setShowKeyboard(false)}
              />
            )}
            {/* "On the House" Toggle */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isOnTheHouse}
                  onChange={(e) => setIsOnTheHouse(e.target.checked)}
                  color="primary"
                />
              }
              label="On the House"
              sx={{ mt: 2 }}
            />
          </Box>
        )}
      </DialogContent>

      {/* Actions at the Bottom */}
      <DialogActions sx={{ justifyContent: 'space-between', padding: 3 }}>
        <Button
          onClick={onClose}
          color="secondary"
          sx={{
            fontWeight: 'bold',
            fontSize: '1.2rem',
            padding: '10px 20px',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveItem}
          variant="contained"
          color="primary"
          sx={{
            fontWeight: 'bold',
            fontSize: '1.2rem',
            padding: '10px 20px',
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(ItemModal);
