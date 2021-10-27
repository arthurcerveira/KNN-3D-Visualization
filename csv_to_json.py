import csv

csvfile = open('./data/haberman.data', 'r')
jsonfile = open('./src/js/data.js', 'w')

fieldnames = ("age", "year_operation", "nodes", "status")
reader = csv.DictReader(csvfile, fieldnames)

jsonfile.write('let data = [\n')

for row in reader:
    jsonfile.write('\t')
    jsonfile.write(str(row))
    jsonfile.write(',\n')

jsonfile.write(']\n')

csvfile.close()
jsonfile.close()
