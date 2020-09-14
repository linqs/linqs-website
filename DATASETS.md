## Adding a Dataset

Adding a dataset is similar in process to adding a publication if it is a LINQS publication, and in many cases before you add your dataset you should add the publication that your dataset is published in first.

There are four steps to adding your dataset:
1) Add the dataset's resources.
2) Add the JSON file describing the dataset's publication.
This is different than for publications.
3) Add the JSON file describing the dataset.
4) Validate your dataset.

Ensure that all files you add are named appropriately. Datasets follow the `<name-of-dataset>.json` convention (i.e. kebab-case), while publications follow the convention spelled out in [publications.md](publications.md).

### Adding the Datasets Resources

Dataset files are hosted at [https://linqs-data.soe.ucsc.edu/public/datasets/](https://linqs-data.soe.ucsc.edu/public/datasets/).
To add your files go to the LINQS public data directory, create a directory called `<name-of-dataset>`, and add a zipped version of your dataset with the same name as the directory you just created.
Ensure that the permissions for these files are correctly set.
If you have questions about how to do this or where exactly files should be placed contact the IT or Data czar.

### Adding the Publication JSON

#### Your Dataset is Published in a LINQS Publication

If your dataset is published in a LINQS publication, then you should add and validate the paper's metadata.
If you are not familiar with this process consult [publications.md](publications.md).
Once you have added the publication, the dataset needs access to that data, so you should create a soft link to the publication's data in the `\datasets\metadata` folder.
This can be done using the following bash command `ln -s <path-to-destination>.json <source>.json` in `\datasets\metadata`.
The name of this file will be used as a key in the dataset metadata file to provide additional information.

#### Your Dataset is **NOT** Published in a LINQS Publication

If your dataset is **not** published in a LINQS publication, then create a valid publication JSON, but rather than putting it in `_data/pubs/` put it in `_data/datasets/references/`.
This will need to pass the same validation test as regular publications, so be sure to follow the same formatting.

### Adding the Dataset JSON

Now we can add the information about the dataset itself. First create a file called `<name-of-dataset>.json` in `_data/datasets/metadata/`.
The easiest way to create the content of this file, is by copying one of the existing dataset metadata files.

The following fields are required:
* `title`
* `description`
* `citation`
* `link`
* `references`

#### `title`

This is the title of your dataset.
It will be displayed as is.

#### `description`

This description should give a user information about what the dataset is used for, as well as what it contains, and how it was collected.

#### `citation`

The citation specifies a file in `_data/datasets/references/`.
It should be the same as the name of the publication file you want rendered as bibtex, and it should be just the file name without a path or extension.

#### `link`

This should be a JSON list each element of which includes:
* `text` which will be displayed on the website,
* `href` which should point to the link the dataset can be obtained at (usually `https://linqs-data.soe.ucsc.edu/public/datasets/<name-of-dataset>/<name-of-dataset>.zip`),
* `md5` which is the MD5 hash of the file at `href`, and
* `size` which is the size of the file at `href`.

If your dataset is hosted on a server that LINQS does not have access to, it is not required to have the md5 and the size.
Otherwise refer to the following sections, which give instructions for the MD5 and the size.

##### Computing the MD5

The MD5 is used for confirming the correctness of the dataset that a potential user has downloaded.
It is a function of the data, so if the data changes so will the MD5 and a wary user will be able to catch the error.

To calculate it navigate to the location of the compressed dataset and enter `md5sum <name-of-compressed-dataset-file>` into a terminal.
Copy the hex string and paste it into the `md5` field.

##### Computing the size

The size should be the size in bytes of the compressed dataset.
To calculate it navigate to the location of the compressed dataset and enter `ls -l <name-of-compressed-dataset-file>` into a terminal.
The size is the number before the date.

#### `references`

This should be a JSON list.
It is required to have at least one element in the list.
Each element is itelf a JSON object including `href` which is the link to a publication's metadata and `text` which is the text displayed, 
Look at other examples of `text` to get the formatting right.
### Validating Your Dataset

To validate your dataset's entry before you commit it, you can run the [/_scripts/validateDatasets.py](_scripts/validateDatasets.py) script.
This script will also be run as part of the continuous integration (CI) for this repository.
If this script reports an error during CI you (and Eriq!) should get an email.
