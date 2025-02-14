import React from 'react';
import WhatAPI from '../../whatAPI';
import AccountInfo from './accountInfo/index';
import TransactionInfo from './transactionInfo/index';
import usePost from '../../../hooks/usePost';
import TransactionJsonDialog from './transactionInfo/TransactionJsonDialog';
import Spinner from '../../spinner';

const balanceMockData = require('./mockJson/uf-balances.json');
const transactionMockData = require('./mockJson/uf-transactions.json');

const config = {
  apiDetails: [
    {
      name: 'Balances',
      backendPath: `/api/server?path=balances`,
      path: 'https://apigatewayqaf.jpmorgan.com/accessapi/balance',
      description:
        'This API returns intraday balances for specific accounts. We use it to get the current day balance for a UAT account.',
      cacheKey: 'balances',
      refreshInterval: 43200000,
    },
    {
      name: 'Transactions',
      path: 'https://apigatewayqaf.jpmorgan.com/tsapi/v2/transactions?relativeDateType=PRIOR_DAY',
      description:
        'This API returns all the transactions for a specific account for a specific time period.',
      backendPath: `/api/server?path=transactions`,
      cacheKey: 'transactions',
      refreshInterval: 1800000,
    },
  ],
};

const AccountPage = () => {
  const [displayingMockedData, setDisplayingMockedData] = React.useState(true);
  const [displayingApiData, setDisplayingApiData] = React.useState(false);
  const [transactionDialogOpen, setTransactionDialogState] =
    React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState({});
  const [selectedAccount, setSelectedAccount] = React.useState({});

  const balanceResults = usePost(
    config.apiDetails[0].backendPath,
    config.apiDetails[0].cacheKey,
    config.apiDetails[0].refreshInterval,
  );

  const transactionResults = usePost(
    config.apiDetails[1].backendPath,
    config.apiDetails[1].cacheKey,
    config.apiDetails[1].refreshInterval,
  );
  const toggleMockedData = () => {
    setDisplayingMockedData(!displayingMockedData);
  };
  const toggleApiData = () => {
    setDisplayingApiData(!displayingApiData);
  };
  const openTransactionDialog = (state, transaction) => {
    setTransactionDialogState(state);
    setSelectedTransaction(transaction);
  };

  const displayAccountPanel = (data) => (
    <AccountInfo
      data={data}
      setSelectedAccount={setSelectedAccount}
      selectedAccount={selectedAccount}
      apiData={config.apiDetails}
      displayingApiData={displayingApiData}
    />
  );

  const displayTransactionPanel = (data) => (
    <TransactionInfo
      transactions={data}
      openTransactionDialog={openTransactionDialog}
      selectedAccount={selectedAccount}
      apiData={config.apiDetails}
      displayingApiData={displayingApiData}
    />
  );

  const displayPanels = () => {
    if (displayingMockedData) {
      return (
        <div className='flex flex-wrap'>
          {displayAccountPanel(balanceMockData)}
          {displayTransactionPanel(transactionMockData)}
        </div>
      );
    } else if (balanceResults.isLoading || transactionResults.isLoading) {
      return (
        <div className='text-center pt-24'>
          <Spinner />
        </div>
      );
    } else if (balanceResults.isError || transactionResults.isError) {
      return (
        <div className='text-center pt-24'>
          {
            'Error gathering information from API. Toggle on mocked data below to see example information'
          }
        </div>
      );
    } else {
      return (
        <div className='flex flex-wrap'>
          {displayAccountPanel(balanceResults?.data)}
          {displayTransactionPanel(transactionResults?.data)}
        </div>
      );
    }
  };

  return (
    <>
      {displayPanels()}
      <TransactionJsonDialog
        open={transactionDialogOpen}
        setTransactionDialog={openTransactionDialog}
        transaction={selectedTransaction}
      />
      <WhatAPI
        toggleMockedData={toggleMockedData}
        config={config}
        mockedDataEnabled={displayingMockedData}
        toggleApiData={toggleApiData}
        apiDataEnabled={displayingApiData}
      />
    </>
  );
};

export default AccountPage;
