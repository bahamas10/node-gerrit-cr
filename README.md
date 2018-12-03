cr
===

Read only CLI interface to Gerrit

Setup
-----

Create a config file at `~/.config/gerrit-cr/config.json`:

``` json
{
    "url": "https://cr.joyent.us",
    "user": "bahamas10"
}
```

Substituting your username in `user`.

Example
-------

Get a list of open changes you have created:

    $ cr changes
    ID    PROJECT                SUBJECT                                                       UPDATED
    2729  joyent/illumos-joyent  OS-5074 want nvlist_print_json_pretty                         1 year ago
    2977  joyent/illumos-joyent  OS-6459 logadm should use absolute paths for filenames        10 months ago
    2970  joyent/zoneinit        DATASET-1318 cleanup zoneinit and make reboot optional        10 months ago
    4720  joyent/smartos-live    OS-7147 consolidate disk_size and removable_disk into dis...  3 months ago

Use `-l` to get more information:

    $ cr changes -l
    ID    URL                             USER       PROJECT                SUBJECT                                                          CHANGES    MERGEABLE  CREATED       UPDATED
    2729  https://cr.joyent.us/#/c/2729/  bahamas10  joyent/illumos-joyent  OS-5074 want nvlist_print_json_pretty                            +295,-134  false      1 year ago    1 year ago
    2977  https://cr.joyent.us/#/c/2977/  bahamas10  joyent/illumos-joyent  OS-6459 logadm should use absolute paths for filenames           +22,-6     false      1 year ago    10 months ago
    2970  https://cr.joyent.us/#/c/2970/  bahamas10  joyent/zoneinit        DATASET-1318 cleanup zoneinit and make reboot optional           +206,-243  true       1 year ago    10 months ago
    4720  https://cr.joyent.us/#/c/4720/  bahamas10  joyent/smartos-live    OS-7147 consolidate disk_size and removable_disk into disklist   +223,-115  false      3 months ago  3 months ago

Get a list of all open reviews with you listed as a reviewer:

    $ cr incoming
    ID    USER         PROJECT                  SUBJECT                                                       UPDATED
    2792  papertigers  joyent/node-sdc-clients  TOOLS-1867 sdc-clients: add paging to napi.listIPs            11 months ago
    4791  jasonbking   joyent/smartos-live      OS-7183 Support early configuration of admin network duri...  2 months ago
    5167  mgerdts      joyent/smartos-live      OS-7413 metadata daemon crashes on bhyve or instance dele...  2 days ago
    5169  mgerdts      joyent/smartos-live      OS-7415 metadata agent should ignore init_restarts "added...  2 days ago

Use `-l` to get more information:

    $ cr incoming -l
    ID    URL                             USER         PROJECT                  SUBJECT                                                              CHANGES  MERGEABLE  CREATED       UPDATED
    2792  https://cr.joyent.us/#/c/2792/  papertigers  joyent/node-sdc-clients  TOOLS-1867 sdc-clients: add paging to napi.listIPs                   +106,-9  false      1 year ago    11 months ago
    4791  https://cr.joyent.us/#/c/4791/  jasonbking   joyent/smartos-live      OS-7183 Support early configuration of admin network during CN boot  +422,-5  false      2 months ago  2 months ago
    5167  https://cr.joyent.us/#/c/5167/  mgerdts      joyent/smartos-live      OS-7413 metadata daemon crashes on bhyve or instance deletion        +7,-2    false      2 days ago    2 days ago
    5169  https://cr.joyent.us/#/c/5169/  mgerdts      joyent/smartos-live      OS-7415 metadata agent should ignore init_restarts "added" actions   +4,-2    false      2 days ago    2 days ago

Use `-p` to specify a project - get all open reviews for a specific project:

    $ cr changes -p joyent/smartos-live
    ID    USER        SUBJECT                                                       UPDATED
    1629  rmustacc    OS-5995 Remove old CTF tools                                  1 year ago
    2095  wiedi       add timeout option for imgadm create                          1 year ago
    2127  twhiteman   OS-6185 use pigz (parallel gunzip uncompression) to speed...  1 year ago
    2573  gwydirsam   IMGAPI-640 Want sdc:operator-script to run before smf ser...  1 year ago
    4145  noahmehl    Increase maximum MTU to 65536                                 5 months ago
    1576  bahamat     OS-5985 vmadm man page incorrectly states dns_domain prop...  5 months ago
    4550  melloc      OS-5474 mdata-get does not properly report tags that incl...  4 months ago
    4467  jasonbking  OS-6818 Have vmadm(1M) utilize route -z for lx zones          3 months ago
    4720  bahamas10   OS-7147 consolidate disk_size and removable_disk into dis...  3 months ago
    4791  jasonbking  OS-7183 Support early configuration of admin network duri...  2 months ago
    55    arekinath   OS-5508 rsyslog should not send kernel NOTICE to the console  2 months ago
    4984  jclulow     OS-7317 vmadm "remove_filesystems" is both broken and und...  1 month ago
    5167  mgerdts     OS-7413 metadata daemon crashes on bhyve or instance dele...  2 days ago
    5169  mgerdts     OS-7415 metadata agent should ignore init_restarts "added...  2 days ago
    5168  mgerdts     OS-7414 runtest should alert if new cores are found           2 days ago
    5170  mgerdts     OS-7352 VM.update should allow disk resize with update_disks  25 minutes ago

Same as above but limited to the user `bahamas10`:

    $ cr changes -p joyent/smartos-live -u bahamas10
    ID    SUBJECT                                                       UPDATED
    4720  OS-7147 consolidate disk_size and removable_disk into dis...  3 months ago

License
-------

MPL
