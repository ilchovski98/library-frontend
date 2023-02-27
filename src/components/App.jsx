import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { WagmiConfig, configureChains, createClient } from 'wagmi';
import { goerli, hardhat } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import * as urql from 'urql';

import Election from '../pages/Election';
import Library from '../pages/Library';

import Header from './layout/Header';
import Footer from './layout/Footer';

const APIURL =
  'https://gateway.testnet.thegraph.com/api/[api-key]/subgraphs/id/5P4HeAhp18YaHzFvWgG2muhFtk8xPp1Vd1WZpBW8oQLq';

const clientUrql = urql.createClient({
  url: APIURL,
});

const query = `
  query {
    returnBooks(first: 10) {
      borrower
      bookName
    }
    ownershipTransferreds(first: 10) {
      id
      newOwner
      previousOwner
      transactionHash
    }
  }
`;

function App() {
  async function fetchData() {
    const response = await clientUrql.query(query).toPromise();
    console.log('response', response);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const { provider } = configureChains([hardhat], [publicProvider()]);

  const client = createClient({
    provider,
    autoConnect: true,
  });

  return (
    <BrowserRouter>
      <WagmiConfig client={client}>
        <div className="wrapper">
          <Header />
          <div className="main">
            <Routes>
              <Route path="/" element={<Library />} />
              <Route path="/election" element={<Election />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </WagmiConfig>
    </BrowserRouter>
  );
}

export default App;
