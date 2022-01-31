import { createSlice } from "@reduxjs/toolkit";
export type Plot = {
  id: number;
  artist: string | null;
  width: number;
  height: number;
  isComplete: boolean;
};

export type Mural = {
  id: string;
  width: number;
  height: number;
  columns: number;
  rows: number;
  artists: string[];
  created_at: Date;
};

export interface MuralsState {
  murals: (Mural & { plots: (Plot & { imageData: ImageData | null })[] })[];
  loading: boolean;
}

export const initialState: MuralsState = {
  murals: [],
  loading: true,
};

// Web3 reducer
export const muralsSlice = createSlice({
  name: "murals",
  initialState,
  reducers: {
    createMural: (
      state,
      {
        payload,
      }: {
        payload: Mural & { plots: (Plot & { imageData: ImageData | null })[] };
      }
    ) => {
      const newData = [...state.murals];
      newData.push(payload);
      state.murals = newData;
    },
    getMurals: (
      state,
      {
        payload,
      }: {
        payload: (Mural & {
          plots: (Plot & { imageData: ImageData | null })[];
        })[];
      }
    ) => {
      state.murals = [...payload];
      state.loading = false;
    },
    updatePlot: (state, { payload }) => {
      const { mural } = payload;
      state.murals = [mural];
    },
  },
});

export const { createMural, updatePlot, getMurals } = muralsSlice.actions;

export default muralsSlice.reducer;
