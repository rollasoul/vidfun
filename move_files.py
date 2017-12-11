import os


# if downloaded file is found rename and move to js folder
while True:
    if os.path.isfile("/Users/rolandarnoldt/Downloads/repl_left_nu.webm") is True:
        os.rename("/Users/rolandarnoldt/Downloads/repl_left_nu.webm", "/Users/rolandarnoldt/Documents/vidfun/repl_left_nu.webm")
        print("moved file left over")
    if os.path.isfile("/Users/rolandarnoldt/Downloads/repl_right_nu.webm") is True:
        os.rename("/Users/rolandarnoldt/Downloads/repl_right_nu.webm", "/Users/rolandarnoldt/Documents/vidfun/repl_right_nu.webm")
        print("moved file right over")
