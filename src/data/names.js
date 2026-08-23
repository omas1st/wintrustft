export const MALE_NAMES = [
  'Alexander Mitchell', 'Benjamin Hayes', 'Christopher Vance', 'Daniel Sterling',
  'Ethan Montgomery', 'Frederick Thorne', 'Gabriel Mercer', 'Harrison Brooks',
  'Isaac Crawford', 'Jonathan Drake', 'Kenneth Wright', 'Lucas Harrington',
  'Marcus Aurelius', 'Nathaniel Cross', 'Oliver Sinclair', 'Patrick Callahan',
  'Quentin Blake', 'Raymond Foster', 'Samuel Davenport', 'Thomas Sterling',
  'Victor Vance', 'William Prescott', 'Xavier Rhodes', 'Zachary Cole',
  'Adrian Pierce', 'Bryan Gallagher', 'Charles Kensington', 'Dominic Russo',
  'Elliot Vance', 'Franklin Bishop', 'Geoffrey Walsh', 'Henry Thornton',
  'Ian Kingsley', 'Julian Mercer', 'Kyle Henderson', 'Leonard Hastings',
  'Matthew Donovan', 'Nicholas Palmer', 'Owen Carlisle', 'Philip Lawrence',
  'Richard Ellsworth', 'Sebastian Locke', 'Trevor Hughes', 'Vincent Vega',
  'Wesley Trent', 'Arthur Pendelton', 'Bradley Cooper', 'Christian Bale',
  'Damian Scott', 'Edward Norton'
];

export const FEMALE_NAMES = [
  'Amelia Vance', 'Beatrice Holloway', 'Charlotte Dubois', 'Diana Montgomery',
  'Eleanor Sterling', 'Fiona Gallagher', 'Grace Kensington', 'Hannah Crawford',
  'Isabella Drake', 'Julia Harrington', 'Katherine Cross', 'Lillian Sinclair',
  'Madeleine Brooks', 'Nora Davenport', 'Olivia Prescott', 'Penelope Rhodes',
  'Rachel Thorne', 'Sophia Mercer', 'Theresa Blake', 'Victoria Foster',
  'Winifred Cole', 'Alexandra Pierce', 'Brianna Walsh', 'Camilla Russo',
  'Daphne Bishop', 'Elena Kingsley', 'Florence Carlisle', 'Gwendolyn Henderson',
  'Harper Hastings', 'Ingrid Donovan', 'Jasmine Palmer', 'Kendra Lawrence',
  'Laura Ellsworth', 'Maya Locke', 'Natalie Hughes', 'Ophelia Vega',
  'Paige Trent', 'Quinn Pendelton', 'Rosalie Cooper', 'Seraphina Scott',
  'Tabitha Norton', 'Uma Thurman', 'Valerie Sterling', 'Willa Vance',
  'Xenia Dubois', 'Yvette Montgomery', 'Zoe Kensington', 'Audrey Hepburn',
  'Claire Danes', 'Evelyn Woods'
];

export const generateWithdrawalPool = () => {
  const pool = [];
  const times = ['Just now', '1m ago', '2m ago', '3m ago', '5m ago', '8m ago', '12m ago', '15m ago', '22m ago', '30m ago', '45m ago', '1h ago'];
  const generateAmount = () => {
    const millions = Math.floor(Math.random() * 30) + 1;
    return millions * 1000000;
  };
  const generateMasked = () => {
    const num = Math.floor(1000000 + Math.random() * 9000000).toString();
    return { raw: num, masked: num.slice(0,3) + '****' };
  };
  const formatCurr = (amt) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amt);

  for (let i = 0; i < 50; i++) {
    const mAcc = generateMasked();
    const fAcc = generateMasked();
    const mAmt = generateAmount();
    const fAmt = generateAmount();
    pool.push({
      id: `m-${i}`,
      name: MALE_NAMES[i],
      maskedAccount: mAcc.masked,
      rawAccountNumber: mAcc.raw,
      amount: mAmt,
      formattedAmount: formatCurr(mAmt),
      timeAgo: times[Math.floor(Math.random() * times.length)]
    });
    pool.push({
      id: `f-${i}`,
      name: FEMALE_NAMES[i],
      maskedAccount: fAcc.masked,
      rawAccountNumber: fAcc.raw,
      amount: fAmt,
      formattedAmount: formatCurr(fAmt),
      timeAgo: times[Math.floor(Math.random() * times.length)]
    });
  }
  return pool.sort(() => Math.random() - 0.5);
};