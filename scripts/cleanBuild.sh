#!/usr/bin/env bash

echo Cleaning the build folders...

dir_dist=dist
dir_node=node_modules
dir_typings=typings

if [ -d "$dir_dist" ]; then
    rm -r "$dir_dist"
    echo Deleted "$dir_dist"
else
    echo "$dir_dist" does not exist
fi

if [ -d "$dir_node" ]; then
    rm -r "$dir_node"
    echo Deleted "$dir_node"
else
    echo "$dir_node" does not exist
fi

if [ -d "$dir_typings" ]; then
    rm -r "$dir_typings"
    echo Deleted "$dir_typings"
else
    echo "$dir_typings" does not exist
fi

echo Done cleaning...
