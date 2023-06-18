import { Card } from '@mui/material';
import { CryptoOrder } from 'src/models/crypto_order';
import RecentOrdersTable from './RecentOrdersTable';
import { subDays } from 'date-fns';

function RecentOrders() {
  const cryptoOrders: CryptoOrder[] = [
    {
      id: '1',
      orderDetails: 'Jan Novák',
      orderDate: new Date().getTime(),
      status: 'ov',
      orderID: '3841',
      sourceName: '92.21',
      sourceDesc: '*** 1111',
      amountCrypto: 34.4565,
      amount: 56787,
      cryptoCurrency: 'ETH',
      currency: '$'
    },
    {
      id: '2',
      orderDetails: 'Emil Trhák',
      orderDate: subDays(new Date(), 1).getTime(),
      status: 'ov',
      orderID: '2931',
      sourceName: '91.35',
      sourceDesc: '*** 1111',
      amountCrypto: 6.58454334,
      amount: 8734587,
      cryptoCurrency: 'BTC',
      currency: '$'
    },
    {
      id: '3',
      orderDetails: 'Jolana Ludovjicová',
      orderDate: subDays(new Date(), 5).getTime(),
      status: 'ov',
      orderID: '2678',
      sourceName: '85.14',
      sourceDesc: '*** 1111',
      amountCrypto: 6.58454334,
      amount: 8734587,
      cryptoCurrency: 'BTC',
      currency: '$'
    },
    {
      id: '4',
      orderDetails: 'František Lámal',
      orderDate: subDays(new Date(), 55).getTime(),
      status: 'ov',
      orderID: '2455',
      sourceName: '81.19',
      sourceDesc: '*** 1111',
      amountCrypto: 6.58454334,
      amount: 8734587,
      cryptoCurrency: 'BTC',
      currency: '$'
    },
    {
      id: '5',
      orderDetails: 'Eva Janová',
      orderDate: subDays(new Date(), 56).getTime(),
      status: 'ov',
      orderID: '2415',
      sourceName: '79.35',
      sourceDesc: '*** 1111',
      amountCrypto: 6.58454334,
      amount: 8734587,
      cryptoCurrency: 'BTC',
      currency: '$'
    },
    {
      id: '6',
      orderDetails: 'Petr Čas',
      orderDate: subDays(new Date(), 33).getTime(),
      status: 'ov',
      orderID: '2341',
      sourceName: '68.9',
      sourceDesc: '*** 1111',
      amountCrypto: 6.58454334,
      amount: 8734587,
      cryptoCurrency: 'BTC',
      currency: '$'
    },
    {
      id: '7',
      orderDetails: 'Filip Oma',
      orderDate: new Date().getTime(),
      status: 'ov',
      orderID: '2231',
      sourceName: '69.36',
      sourceDesc: '*** 1212',
      amountCrypto: 2.346546,
      amount: 234234,
      cryptoCurrency: 'BTC',
      currency: '$'
    },
    {
      id: '8',
      orderDetails: 'John Newron',
      orderDate: subDays(new Date(), 22).getTime(),
      status: 'ov',
      orderID: '2124',
      sourceName: '59.98',
      sourceDesc: '*** 1111',
      amountCrypto: 3.345456,
      amount: 34544,
      cryptoCurrency: 'BTC',
      currency: '$'
    },
    {
      id: '9',
      orderDetails: 'Ivan Mládek',
      orderDate: subDays(new Date(), 11).getTime(),
      status: 'ov',
      orderID: '1577',
      sourceName: '62.19',
      sourceDesc: '*** 2222',
      amountCrypto: 1.4389567945,
      amount: 123843,
      cryptoCurrency: 'BTC',
      currency: '$'
    },
    {
      id: '10',
      orderDetails: 'Arnošt Rustl',
      orderDate: subDays(new Date(), 123).getTime(),
      status: 'ov',
      orderID: '1475',
      sourceName: '49.63',
      sourceDesc: "John's Cardano Wallet",
      amountCrypto: 765.5695,
      amount: 7567,
      cryptoCurrency: 'ADA',
      currency: '$'
    }
  ];

  return (
    <Card>
      <RecentOrdersTable cryptoOrders={cryptoOrders} />
    </Card>
  );
}

export default RecentOrders;
