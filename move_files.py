import os


# if downloaded file is found rename and move to js folder
while True:
    if os.path.isfile("/Users/rolandarnoldt/Downloads/repl_left_nu.webm") is True:
        os.rename("/Users/rolandarnoldt/Downloads/repl_left_nu.webm", "/Users/rolandarnoldt/Documents/vidfun/repl_left_nu.webm")\
        print("moved file over")
