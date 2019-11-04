const XLSX = require('../src');

const xlsx = new XLSX();

const redText = xlsx.style({
	color: 'f00',
	fontFamily: 'Baloo Bhaijaan',
	fontWeight: 'bold',
	fontSize: 14,
});

const sheet1 = xlsx.sheet('Sheet 1');
sheet1.set(120000, { row: 5, col: 4 });
sheet1.set('bbb', {
	row: 6,
	col: 5,
	style: redText,
});
sheet1.set('People', { row: 1, col: 1 });
sheet1.set('vzf', { row: 2, col: 1 });
sheet1.set('gdb', { row: 3, col: 1 });
sheet1.set('bsy', { row: 4, col: 1 });
sheet1.set('kga', { row: 5, col: 1 });
sheet1.set('lbv', { row: 6, col: 1 });
sheet1.set('tew', { row: 7, col: 1 });
sheet1.addFilter({
	from: { row: 1, col: 1 },
	to: { row: 7, col: 1 },
});

xlsx.save('filename.xlsx', true);
