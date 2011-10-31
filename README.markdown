jQueryTools site made with hyde: http://github.com/hyde/hyde

# Setup

1. Install pip, virtualenv & virtualenvwrapper:

        sudo easy_install pip
        sudo easy_install virtualenv
        pip install virtualenvwrapper

    Note where pip installs virtualenvwrapper.

2. Add the following two lines to your shell startup file(`~/.bash_profile` for example).

        export WORKON_HOME=~/.virtualenv
        source /usr/local/bin/virtualenvwrapper.sh

    Ensure that the `virtualenvwrapper.sh` file is prefixed with the path noted in step 1.

3. Clone this repository, and its submodules:

        git clone git@github.com:jquerytools/site.git
        git submodule init
        git submodule update

4. Setup your [virtual environment](http://www.doughellmann.com/docs/virtualenvwrapper/)

        mkvirtualenv jqt

    You can use `workon jqt` to switch to the environment after the first time.

5. Install the requirements:

        cd ~/path/to/this/repo
        pip install -r requirements.txt

6. Install [stylus](http://learnboost.github.com/stylus/) which requires [node.js](http://nodejs.org/):

        curl -O http://nodejs.org/dist/node-v0.4.2.tar.gz
        tar zxvf node-v0.4.2.tar.gz
        cd node-v0.4.2
        mkdir ~/local
        ./configure --prefix=$HOME/local
        make
        make install
        export PATH=$HOME/local/bin:$PATH
        curl http://npmjs.org/install.sh | sh
        npm install stylus

You are all set.


# Running

Ensure that you are in the correct virtual environment(`workon jqt`).

1. `hyde gen` - generates the website.

    *   `hyde gen -r` - refreshes the website, regenerating everything.
    *   `hyde gen -c dev.yaml` - generates the website where the url's for
        swf files point to local versions under `content/swf`.

2. `hyde serve` - starts the built in web server.
3. `hyde serve -c dev.yaml` - starts the built in web server with url's for
    swf files pointing to the local version sunder `content/swf`.

# Building jquerytools for the download page

1. `npm install` - Installs dependencies for the builder
2. `node build.js` - Creates a dist directory under downloads and pulls the jquery tools source and compresses them.