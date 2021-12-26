import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { getAccounts, selectNetwork } from "../../../utils/network";
import type { AppState } from "../../app/store";

interface Web3State {
  data: {
    address: string | null;
    ens: string | null;
    avatar: string | null;
    chainId: string;
    network: string;
  };
  loading: boolean;
  error: boolean;
}

const initialState: Web3State = {
  data: {
    address: null,
    ens: null,
    avatar: null,
    chainId: "",
    network: "",
  },
  loading: false,
  error: false,
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const connectWallet = createAsyncThunk(
  "web3/connectWallet",
  async () => {
    if (!window.ethereum) {
      throw new Error("Must install metamask");
    }
    // App asks user for permission to view metamask accounts
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const network = selectNetwork(window.ethereum.chainId);
    const accountData = await getAccounts();
    // The value we return becomes the `fulfilled` action payload
    return { ...accountData, network };
  }
);

// Handles changing user account
export const changeAccount = createAsyncThunk(
  "web3/changeAccount",
  async () => {
    if (!window.ethereum || !window.ethereum.selectedAddress) {
      return { ...initialState.data };
    }
    try {
      const network = selectNetwork(window.ethereum.chainId);
      const accountData = await getAccounts();
      return { ...accountData, network };
    } catch (e) {
      console.log(e);
      return { ...initialState.data };
    }
  }
);

// Handles changing the network the user is on
export const changeNetwork = createAsyncThunk(
  "web3/changeNetwork",
  async (chainId: string) => {
    try {
      const network = selectNetwork(chainId);
      const accountData = await getAccounts();
      return { ...accountData, chainId, network };
    } catch (e) {
      console.log(e);
      return { ...initialState.data };
    }
  }
);

// Web3 reducer
export const web3 = createSlice({
  name: "web3",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    disconnectWallet: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.data = { ...initialState.data };
    },
    error: (state) => {
      state.error = true;
      state.data = { ...initialState.data };
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isAnyOf(
          connectWallet.fulfilled,
          changeAccount.fulfilled,
          changeNetwork.fulfilled
        ),
        (state, action) => {
          state.loading = false;
          state.data = action.payload;
          state.error = false;
        }
      )
      .addMatcher(
        isAnyOf(
          connectWallet.pending,
          changeAccount.pending,
          changeNetwork.pending
        ),
        (state) => {
          state.loading = true;
          state.error = false;
        }
      )
      .addMatcher(
        isAnyOf(connectWallet.rejected, changeAccount.rejected),
        (state) => {
          state.loading = false;
          state.error = true;
        }
      );
  },
});

export const { disconnectWallet } = web3.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectData = (state: AppState) => state.web3.data;

export default web3.reducer;