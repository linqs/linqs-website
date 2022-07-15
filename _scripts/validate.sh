#!/bin/bash

readonly THIS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

function main() {
    if [[ $# -ne 0 ]]; then
        echo "USAGE: $0"
        exit 1
    fi

    set -e
    trap exit SIGINT

    for validationScript in "${THIS_DIR}/validate-"* ; do
        echo "Running validation script ${validationScript} ..."
        "${validationScript}"
    done
}

[[ "${BASH_SOURCE[0]}" == "${0}" ]] && main "$@"
