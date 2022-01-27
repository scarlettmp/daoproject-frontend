import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { ChainId, getAccounts, selectNetwork } from "../../../utils/network";
import type { AppState } from "../../app/store";
import { requestAccounts } from "../../../utils/network";
import type { Network } from "../../../utils/network";
import type { AsyncThunkConfig } from "../../../utils/redux";
import { walletConnected } from "../snackbar/snackbarSlice";
import { NextRouter } from "next/router";

interface Web3Data {
  address: string | null;
  ens: string | null;
  avatar: string | null;
  chainId?: ChainId;
  network?: Network;
}

export interface Web3State {
  data: Web3Data;
  loading: boolean;
  error?: string;
  isMetamask: boolean;
  isConnected?: boolean;
}

export const initialState: Web3State = {
  data: {
    address: null,
    ens: null,
    avatar: null,
  },
  loading: false,
  isMetamask: false,
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const connectWallet = createAsyncThunk<
  Web3Data & { router: NextRouter },
  { router: NextRouter },
  AsyncThunkConfig
>("web3/connectWallet", async ({ router }, { dispatch, rejectWithValue }) => {
  try {
    const { ethereum } = window;
    if (!ethereum) {
      throw new Error("Must install metamask");
    }
    // App asks user for permission to view metamask accounts
    const accounts = await requestAccounts();
    if (accounts.length > 0) {
      const network: Network = selectNetwork(window.ethereum.chainId);
      const accountData = await getAccounts(accounts[0]);
      // Show connection successful snackbar
      dispatch(walletConnected());
      // The value we return becomes the `fulfilled` action payload
      return { ...accountData, network, router };
    }
    throw new Error("User denied permission");
  } catch (e: any) {
    console.log(e);
    return rejectWithValue(e);
  }
});

// Handles changing user account
export const changeAccount = createAsyncThunk<
  { ens: string | null; avatar: string | null; address: string | null },
  { address: string | null },
  AsyncThunkConfig
>("web3/changeAccount", async ({ address }, { rejectWithValue }) => {
  const { ethereum } = window;
  if (!ethereum) {
    return { ...initialState.data };
  }
  try {
    let ens: string | null = null;
    let avatar: string | null = null;
    if (ethereum.chainId === "0x1" && address) {
      const { ens: ensDomain, avatar: avatarPic } = await getAccounts(address);
      ens = ensDomain;
      avatar = avatarPic;
    }
    return { ens, avatar, address };
  } catch (e: any) {
    return rejectWithValue(e);
  }
});

// Handles changing the network the user is on
export const changeNetwork = createAsyncThunk<
  {
    network?: Network;
    ens: string | null;
    avatar: string | null;
    chainId?: ChainId;
  },
  { chainId: ChainId },
  AsyncThunkConfig
>("web3/changeNetwork", async ({ chainId }, { rejectWithValue }) => {
  const { ethereum } = window;
  try {
    const accounts = await requestAccounts();
    let ens: string | null = null;
    let avatar: string | null = null;
    if (ethereum.chainId === "0x1" && accounts.length > 0) {
      const { ens: ensDomain, avatar: avatarPic } = await getAccounts(
        accounts[0]
      );
      ens = ensDomain;
      avatar = avatarPic;
    }
    const network: Network = selectNetwork(chainId);
    return { network, ens, avatar, chainId };
  } catch (e: any) {
    return rejectWithValue(e);
  }
});

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
      state.isConnected = false;
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.fulfilled, (state, { payload }) => {
        const { address, router } = payload;
        state.loading = false;
        state.data = { ...payload };
        state.error = undefined;
        if (address) {
          state.isConnected = true;
        }
        // After connecting, route to canvas page
        // if (router.pathname === "/canvas") return;
        // router.push("/canvas").catch((e) => console.log(e));
      })
      .addCase(changeAccount.fulfilled, (state, action) => {
        const {
          payload: { ens, avatar, address },
        } = action;
        state.data.ens = ens;
        state.data.avatar = avatar;
        state.data.address = address;
      })
      .addCase(changeNetwork.fulfilled, (state, action) => {
        const {
          payload: { ens, avatar, chainId, network },
        } = action;
        state.data.ens = ens;
        state.data.avatar = avatar;
        state.data.chainId = chainId;
        state.data.network = network;
      })
      .addMatcher(
        isAnyOf(
          connectWallet.pending,
          changeAccount.pending,
          changeNetwork.pending
        ),
        (state) => {
          state.loading = true;
        }
      )
      .addMatcher(
        isAnyOf(
          connectWallet.rejected,
          changeNetwork.rejected,
          changeAccount.rejected
        ),
        (state, { payload }) => {
          // Keep this log for errors
          console.log(payload);
          if (!payload) return;
          const { message } = payload;
          state.loading = false;
          state.error = message;
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
