"""index.html에 나오는 글자만 남긴 Jua 글꼴을 만든다 (캔버스 글씨는 글꼴 쪼개 받기가 안 되므로).
글자를 바꾸면 빌드 전에 다시 돌린다:  python3 tools/subset_font.py"""
import os, subprocess, string
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=open(os.path.join(root,'index.html'),encoding='utf-8').read()
chars=set(string.printable)|{c for c in src if ord(c)>127}
chars|=set('0123456789×→←‹›…·!?%+-/()[]~')
txt=os.path.join(root,'tools','.chars.txt');open(txt,'w',encoding='utf-8').write(''.join(sorted(chars)))
out=os.path.join(root,'public','fonts','jua-sb.woff2')
subprocess.check_call(['pyftsubset',os.path.join(root,'tools','fonts','Jua-Regular.ttf'),f'--text-file={txt}','--flavor=woff2',f'--output-file={out}','--layout-features=*'])
print(len(chars),'chars ->',out,os.path.getsize(out),'bytes')
