#!/bin/bash

set -ex

alembic upgrade head

# Run command
${@}