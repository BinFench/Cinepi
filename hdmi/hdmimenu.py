#! /usr/bin/env python3
import sys
import os
import locale
import subprocess
from dialog import Dialog

class MenuSystem():
    def __init__(self):
        self.d = Dialog(dialog="dialog")
        self.mtmSelect = ""
        self.movielist = []
        self.tvlist = []
        self.misclist = []
        self.directory = "/mnt"

    def get_video_list(self):
        for root, dirs, files in os.walk(self.directory, topdown=False):
            for f in files:
                if ".mkv" in f or ".mp4" in f:
                    if "movie" in root:
                        self.movielist.append("{}/{}".format(root, f))
                    elif "tv" in root:
                        self.tvlist.append("{}/{}".format(root, f))
                    else:
                        self.misclist.append("{}/{}".format(root, f))
        self.main_menu()


    def main_menu(self):
        """
        This is the main screen when loading up the play, select movies
        tv or micc
        """
        choices=[("Movies", ""),
                 ("TV", ""),
                 ("MISC", "")]
        code, tag = self.d.menu("CinePi: The poor man's netflix", choices=choices)
        if code == self.d.OK:
            self.mtmSelect = tag
            self.videoSelect()
        else:
            self.main_menu()


    def videoSelect(self):
        videolist = self.movielist if self.mtmSelect == "Movies" else (self.tvlist if self.mtmSelect == "TV" else self.misclist)
        choices = []
        yeet = {}
        for item in videolist:
            tmp = item.rsplit("/", 1)
            name = tmp[-1]
            yeet[name] = tmp[0]
            choices.append(("{}".format(name), ""))

        code, tag = self.d.menu("CinePi: The poor man's netflix", choices=choices)
        if code == self.d.OK:
            self.videoInfo(yeet[tag], tag)
        else:
            self.main_menu()

    def videoInfo(self, videopath, video):
        infoFile = "{}/video.info".format(videopath)
        code = self.d.yesno("you selected {}\nDo you want to play?", height=None, width=None, **kwargs)
        if code == self.d.OK:
            command = "omxplayer -p -o hdmi {}/{}".format(videopath, video)
            cmd = subprocess.Popen(command, shell=True)
            cmd.communicate()

        self.videoSelect()


def main():
    locale.setlocale(locale.LC_ALL, '')
    newMenu = MenuSystem()
    newMenu.get_video_list()

if __name__ == "__main__":
    main()
